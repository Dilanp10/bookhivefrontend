import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaBook, FaSearch, FaFilter, FaStar, FaUser, FaPlus, FaTrash, FaBookOpen, FaHome, FaHeart } from "react-icons/fa";

function Home() {
  const [profile, setProfile] = useState(null);
  const [externalBooks, setExternalBooks] = useState([]);
  const [localBooks, setLocalBooks] = useState([]);
  const [filteredExternalBooks, setFilteredExternalBooks] = useState([]);
  const [filteredLocalBooks, setFilteredLocalBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const categories = ["todos", "Ficción", "No ficción", "Ciencia", "Literatura", "Aventura", "Fantasia", "Romance"];
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfile = localStorage.getItem("activeProfile");
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Debes iniciar sesión");
      navigate("/login");
      return;
    }

    if (!storedProfile) {
      navigate("/profiles");
      return;
    }

    const parsedProfile = JSON.parse(storedProfile);

    // Obtener rol real del usuario
    axios.get("https://backend-bookhive-1.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        const merged = { ...parsedProfile, role: data.role };
        setProfile(merged);
        fetchBooks(parsedProfile.ageGroup);
        fetchLocalBooks(parsedProfile.ageGroup);
      })
      .catch((err) => {
        console.error(err);
        toast.error("No se pudo verificar tu rol");
        navigate("/login");
      });
  }, [navigate]);

  // Fetching books from the external API
  const fetchBooks = async (ageGroup) => {
    setIsLoading(true);
    try {
      const query = `libros para ${ageGroup}`;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`
      );
      const items = response.data.items || [];
      const mapped = items.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || "Autor desconocido",
        description: item.volumeInfo.description || "Sin descripción",
        coverUrl: item.volumeInfo.imageLinks?.thumbnail || "",
        categories: item.volumeInfo.categories || ["General"],
        publishedDate: item.volumeInfo.publishedDate || "",
        type: "external",
      }));
      setExternalBooks(mapped);
      setFilteredExternalBooks(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar libros externos");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetching books from the local DB (manual entries)
  const fetchLocalBooks = async (ageGroup) => {
    setIsLoadingLocal(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para ver tus libros locales");
        return;
      }
      const response = await axios.get("https://backend-bookhive-1.onrender.com/api/manual-books", {
        params: { ageGroup },
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped = response.data.map((b) => ({ ...b, type: "local" }));
      setLocalBooks(mapped);
      setFilteredLocalBooks(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar libros locales");
    } finally {
      setIsLoadingLocal(false);
    }
  };

  // Filter both lists by search / category
  useEffect(() => {
    const term = searchTerm.toLowerCase();
  
    const normalizeString = (str) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    const matchesCategory = (bookCategories, filter) => {
      if (!bookCategories || !Array.isArray(bookCategories)) return false;
      return bookCategories.some((cat) =>
        normalizeString(cat).includes(normalizeString(filter))
      );
    };
  
    let ext = externalBooks;
    if (term) {
      ext = ext.filter((b) =>
        normalizeString(b.title).includes(normalizeString(term)) ||
        (b.author && normalizeString(b.author).includes(normalizeString(term)))
      );
    }
    if (categoryFilter !== "todos") {
      ext = ext.filter((b) => matchesCategory(b.categories, categoryFilter));
    }
    setFilteredExternalBooks(ext);
  
    let loc = localBooks;
    if (term) {
      loc = loc.filter((b) =>
        normalizeString(b.title).includes(normalizeString(term)) ||
        (b.author && normalizeString(b.author).includes(normalizeString(term)))
      );
    }
    if (categoryFilter !== "todos") {
      loc = loc.filter((b) => matchesCategory(b.categories, categoryFilter));
    }
    setFilteredLocalBooks(loc);
  }, [searchTerm, categoryFilter, externalBooks, localBooks]);

  // Guarda libro externo como favorito
  const handleSaveBook = async (book) => {
    console.log('🔥 handleSaveBook llamado con:', book);
    const token = localStorage.getItem("token");
    if (!token || !profile) {
      toast.error("Debes iniciar sesión para guardar libros");
      return;
    }
    try {
      const payload = {
        profileId:    profile._id,
        source:       "external",
        googleBookId: book.id,
        title:        book.title,
        author:       book.author,
        description:  book.description,
        coverUrl:     book.coverUrl,
        categories:   book.categories,
      };
      console.log('📤 Enviando a /api/favorites:', payload);

      const res = await axios.post(
        "https://backend-bookhive-1.onrender.com/api/favorites",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Respuesta del servidor:', res.status, res.data);
      toast.success("Libro guardado en favoritos");
    } catch (err) {
      console.error("❌ Error guardando libro externo:", err);
      const msg = err.response?.data?.message || "Error al guardar el libro externo";
      toast.error(msg);
    }
  };

  // Guarda libro local como favorito
  const handleSaveLocalBook = async (book) => {
    const token = localStorage.getItem("token");
    const profile = JSON.parse(localStorage.getItem("activeProfile"));

    if (!token || !profile?._id || !book?._id) {
      toast.error("Faltan datos necesarios para guardar el favorito");
      return;
    }

    try {
      const response = await axios.post(
        "https://backend-bookhive-1.onrender.com/api/favorites",
        {
          profileId: profile._id,
          source: "manual",
          bookId: book._id
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      toast.success("Libro guardado en favoritos");
      return response.data;
    } catch (error) {
      console.error("Error al guardar favorito:", {
        error: error.message,
        response: error.response?.data
      });

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error al guardar el libro";
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete local manual book
  const handleDeleteLocalBook = async (bookId) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer."
    );
    if (!isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para eliminar libros");
        return;
      }
      await axios.delete(`https://backend-bookhive-1.onrender.com/api/manual-books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Libro local eliminado correctamente");
      fetchLocalBooks(profile.ageGroup);
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el libro local");
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 relative overflow-hidden">
      {/* Elementos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-slate-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Toaster para notificaciones */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 border-l-4 border-blue-500 shadow-lg',
          duration: 3000,
        }} 
      />

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <FaHome className="text-white text-lg" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                  ¡Hola, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{profile.name}</span>!
                </h1>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Descubre tu próxima gran aventura literaria...
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/favoritos")}
                className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 border border-slate-200 dark:border-gray-600 hover:-translate-y-0.5"
              >
                <FaHeart className="text-red-400" />
                <span>Mis Favoritos</span>
              </button>
              
              <button
                onClick={() => navigate("/perfil")}
                className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 border border-slate-200 dark:border-gray-600 hover:-translate-y-0.5"
              >
                <FaUser className="text-blue-500" />
                <span>Cambiar Perfil</span>
              </button>
              
              {profile.role === "admin" && (
                <button
                  onClick={() => navigate("/crear-libro")}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <FaPlus />
                  <span>Nuevo Libro</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-gray-600/50 mb-10">
            <div className="flex items-center space-x-2 mb-4">
              <FaSearch className="text-blue-500" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Explorar Biblioteca
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, autor..."
                    className="w-full p-4 pl-12 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    className="w-full p-4 pl-12 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-slate-800 dark:text-slate-200 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "todos" ? "Todas las categorías" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <button 
                  onClick={() => { setSearchTerm(""); setCategoryFilter("todos"); }}
                  className="w-full h-full py-4 bg-slate-100 dark:bg-gray-600 hover:bg-slate-200 dark:hover:bg-gray-500 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {/* Libros recomendados */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <FaBookOpen className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                Libros Recomendados
              </h2>
            </div>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {filteredExternalBooks.length} {filteredExternalBooks.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredExternalBooks.length === 0 ? (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-slate-200/50 dark:border-gray-600/50">
              <div className="text-6xl mb-4 text-slate-300 dark:text-slate-600">📚</div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || categoryFilter !== "todos" 
                  ? "No encontramos libros con esos criterios" 
                  : "No hay recomendaciones disponibles en este momento"}
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setCategoryFilter("todos"); }}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Ver Todos los Libros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredExternalBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-gray-600/50"
                >
                  <div className="relative h-72 mb-5 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="text-6xl text-slate-300 dark:text-slate-600">
                        <FaBook />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="flex flex-col h-32">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {book.author}
                    </p>
                    
                    <div className="mt-auto flex space-x-2">
                      <button
                        onClick={() => navigate(`/libro/${book.id}`)}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm font-medium"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveBook(book);
                        }}
                        className="w-12 py-3 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-slate-300 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
                        title="Guardar en favoritos"
                      >
                        <FaStar className="text-yellow-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Libros locales */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <FaBook className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                Tu Colección Personal
              </h2>
            </div>
            <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
              {filteredLocalBooks.length} {filteredLocalBooks.length === 1 ? 'libro' : 'libros'}
            </span>
          </div>
          
          {isLoadingLocal ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : filteredLocalBooks.length === 0 ? (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-slate-200/50 dark:border-gray-600/50">
              <div className="text-6xl mb-4 text-slate-300 dark:text-slate-600">📖</div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || categoryFilter !== "todos" 
                  ? "No hay libros en tu colección con esos criterios" 
                  : "Tu colección personal está vacía"}
              </p>
              {profile.role === "admin" && (
                <button
                  onClick={() => navigate("/crear-libro")}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Agregar Primer Libro
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredLocalBooks.map((book) => (
                <div 
                  key={book._id} 
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-gray-600/50 relative"
                >
                  {/* Botón de eliminar */}
                  {profile.role === "admin" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLocalBook(book._id);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 hover:scale-110"
                      title="Eliminar libro"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                  
                  <div className="relative h-72 mb-5 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="text-6xl text-slate-300 dark:text-slate-600">
                        <FaBook />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="flex flex-col h-32">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {book.author}
                    </p>
                    
                    <div className="mt-auto flex space-x-2">
                      <button
                        onClick={() => navigate(`/libro/${book._id}`)}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm font-medium"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveLocalBook(book);
                        }}
                        className="w-12 py-3 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-slate-300 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
                        title="Guardar en favoritos"
                      >
                        <FaStar className="text-yellow-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;