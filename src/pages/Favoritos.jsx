import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaHeart, FaArrowLeft, FaTrash, FaBook, FaExclamationTriangle, FaHome, FaSync } from "react-icons/fa";

function Favoritos() {
  const [profile, setProfile] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar favoritos con manejo robusto de errores
  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const storedProfile = localStorage.getItem("activeProfile");
      const token = localStorage.getItem("token");
  
      if (!storedProfile || !token) {
        navigate("/profiles");
        return;
      }
  
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
  
      const response = await axios.get(
        `https://backend-bookhive-1.onrender.com/api/favorites`,
        {
          params: { profileId: parsedProfile._id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Manejar diferentes formatos de respuesta
      const responseData = response.data?.data || response.data;
      if (!Array.isArray(responseData)) {
        throw new Error("Formato de respuesta inesperado del servidor");
      }
  
      setFavoritos(responseData);
    } catch (error) {
      console.error("Error al cargar favoritos:", {
        error: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
  
      setError(error.response?.data?.message || error.message);
  
      if (error.response?.status === 401) {
        navigate("/profiles");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar favorito con actualización optimista
  const handleRemoveFavorite = async (favoriteId) => {
    const previousFavorites = [...favoritos];
    
    try {
      const token = localStorage.getItem("token");
      const profile = JSON.parse(localStorage.getItem("activeProfile"));
  
      if (!token || !profile) {
        throw new Error("missing_authentication");
      }
  
      // Actualización optimista
      setFavoritos(prev => prev.filter(fav => fav._id !== favoriteId));
  
      const source = axios.CancelToken.source();
      const timeout = setTimeout(() => source.cancel("Timeout"), 8000);
  
      const response = await axios.delete(
        `https://backend-bookhive-1.onrender.com/api/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cancelToken: source.token
        }
      );
  
      clearTimeout(timeout);
  
      if (!response.data?.success) {
        throw new Error(response.data.message || "invalid_response");
      }
  
      toast.success("Eliminado de favoritos", {
        position: "top-right",
        duration: 2000
      });
  
    } catch (error) {
      setFavoritos(previousFavorites);
      
      let errorMessage = "Error al eliminar";
      let shouldReload = false;
      let shouldLogout = false;

      if (axios.isCancel(error)) {
        errorMessage = "La solicitud tardó demasiado";
      } else if (error.message === "missing_authentication") {
        errorMessage = "Sesión expirada";
        shouldLogout = true;
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "No autorizado - sesión expirada";
            shouldLogout = true;
            break;
          case 403:
            errorMessage = "No tienes permiso para esta acción";
            break;
          case 404:
            errorMessage = "El elemento ya no existe en favoritos";
            shouldReload = true;
            break;
          case 500:
            errorMessage = "Error del servidor";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }
  
      toast.error(errorMessage, {
        position: "top-right",
        duration: 3000
      });
  
      if (shouldLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("activeProfile");
        setTimeout(() => navigate("/login"), 1500);
      }
  
      if (shouldReload) {
        await loadFavorites();
      }
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [navigate]);

  // Pantalla de carga
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando tus favoritos...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 p-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-gray-600/50 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
            Error al cargar favoritos
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={loadFavorites}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <FaSync className="text-sm" />
              <span>Reintentar</span>
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 relative overflow-hidden">
      {/* Elementos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Toaster para notificaciones */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 border-l-4 border-pink-500 shadow-lg',
          duration: 3000,
        }} 
      />

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg">
                <FaHeart className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                  Mis <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Favoritos</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                  Colección personal de {profile.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md border border-slate-200/50 dark:border-gray-600/50">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {favoritos.length} {favoritos.length === 1 ? 'libro guardado' : 'libros guardados'}
                </span>
              </div>
              {favoritos.length > 0 && (
                <div className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                  <span className="text-xs font-medium text-pink-700 dark:text-pink-300">
                    ❤️ Tu colección especial
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 border border-slate-200 dark:border-gray-600 hover:-translate-y-0.5"
            >
              <FaArrowLeft className="text-blue-500" />
              <span>Volver a Biblioteca</span>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10">
          {favoritos.length === 0 ? (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-slate-200/50 dark:border-gray-600/50 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-4xl text-pink-400 dark:text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Tu estantería de favoritos está vacía
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Guarda tus libros favoritos para encontrarlos fácilmente más tarde y crear tu colección personal de lecturas especiales.
              </p>
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2 mx-auto"
              >
                <FaHome />
                <span>Explorar Libros</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {favoritos.map((favorite) => {
                const book = favorite.externalBook || favorite.manualBook || favorite;
                return (
                  <div 
                    key={favorite._id} 
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-gray-600/50 relative"
                  >
                    {/* Botón eliminar */}
                    <button 
                      onClick={() => handleRemoveFavorite(favorite._id)}  
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 hover:scale-110"
                      title="Eliminar de favoritos"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                    
                    {/* Portada del libro */}
                    <div className="relative h-72 mb-5 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                      {book.coverUrl ? (
                        <img 
                          src={book.coverUrl} 
                          alt={book.title || 'Libro sin título'} 
                          className="h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`${book.coverUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                        <div className="text-6xl text-slate-300 dark:text-slate-600">
                          <FaBook />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Badge de favorito */}
                      <div className="absolute top-3 left-3 p-2 bg-pink-500 rounded-full shadow-lg">
                        <FaHeart className="text-white text-sm" />
                      </div>
                    </div>
                    
                    {/* Información del libro */}
                    <div className="flex flex-col h-32">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 leading-tight">
                        {book.title || 'Título no disponible'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-1">
                        {book.author || "Autor desconocido"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-3 flex-grow">
                        {book.description || 'Descripción no disponible'}
                      </p>
                      
                      {/* Categorías */}
                      {(book.category || book.categories) && (
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                            {book.category || book.categories?.[0] || 'General'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favoritos;