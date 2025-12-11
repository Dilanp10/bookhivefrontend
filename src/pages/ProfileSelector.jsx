import { useNavigate } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import toast, { Toaster } from "react-hot-toast";
import { FaBookOpen, FaUserEdit, FaSignOutAlt, FaTrash, FaPlus, FaUser, FaChild, FaUserGraduate } from "react-icons/fa";

function ProfileSelector() {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", avatar: "", age: "" });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Obtener perfiles del usuario
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://backend-bookhive-1.onrender.com/api/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(res.data);
    } catch (error) {
      console.error("Error al obtener perfiles:", error);
      toast.error("No se pudieron cargar los perfiles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Seleccionar perfil
  const handleSelect = (profile) => {
    localStorage.setItem("activeProfile", JSON.stringify(profile));
    toast.success(`¡Bienvenido ${profile.name}!`);
    navigate("/home");
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear nuevo perfil
  const handleCreateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://backend-bookhive-1.onrender.com/api/profiles",
        { ...formData, age: Number(formData.age) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfiles([...profiles, res.data]);
      setFormData({ name: "", avatar: "", age: "" });
      setShowForm(false);
      toast.success("Perfil creado exitosamente.");
    } catch (error) {
      console.error("Error al crear perfil:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error al crear perfil.");
    }
  };

  // Eliminar perfil
  const handleDeleteProfile = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://backend-bookhive-1.onrender.com/api/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(profiles.filter((p) => p._id !== id));
      toast.success("Perfil eliminado.");
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      toast.error("No se pudo eliminar el perfil.");
    }
  };

  // Cerrar sesión
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeProfile");
    toast.success("Sesión cerrada correctamente.");
    navigate("/login");
  };

  // Obtener icono según la edad
  const getAgeIcon = (age) => {
    if (age < 13) return <FaChild className="text-lg" />;
    if (age < 18) return <FaUserGraduate className="text-lg" />;
    return <FaUser className="text-lg" />;
  };

  // Obtener color según la edad
  const getAgeColor = (age) => {
    if (age < 13) return "from-blue-400 to-cyan-400";
    if (age < 18) return "from-green-400 to-emerald-400";
    return "from-purple-400 to-indigo-400";
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 relative overflow-hidden">
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

      {/* Header con logo y botón de cerrar sesión */}
      <header className="relative z-10 w-full max-w-6xl flex justify-between items-center p-6">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
            <FaBookOpen className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            BookHive
          </h1>
        </div>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 rounded-xl shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 border border-slate-200 dark:border-gray-600 hover:-translate-y-0.5"
        >
          <FaSignOutAlt className="text-slate-500" />
          <span>Salir</span>
        </button>
      </header>

      {/* Modal de confirmación de logout */}
      <Transition appear show={isLogoutModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsLogoutModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <FaSignOutAlt className="text-red-500 text-lg" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Cerrar sesión
                    </Dialog.Title>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      ¿Estás seguro de que deseas salir de tu cuenta?
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => setIsLogoutModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-0.5"
                      onClick={confirmLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Contenido principal */}
      <main className="relative z-10 flex flex-col items-center w-full max-w-6xl px-6 py-8 flex-1">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-sm mb-6 border border-slate-200 dark:border-gray-600">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Conectado</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4 leading-tight">
            ¿Quién está <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">leyendo</span> hoy?
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Selecciona tu perfil para sumergirte en tu biblioteca personal o crea un nuevo perfil para compartir la magia de la lectura.
          </p>
        </div>

        {/* Lista de perfiles */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-12">
            {profiles.map((profile) => (
              <div
                key={profile._id}
                className="relative group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-gray-600/50"
              >
                <button 
                  onClick={() => handleSelect(profile)} 
                  className="w-full h-full p-6 flex flex-col items-center relative z-10"
                >
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden shadow-inner">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`p-6 rounded-2xl bg-gradient-to-r ${getAgeColor(profile.age)} shadow-lg`}>
                          {getAgeIcon(profile.age)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg">
                      {getAgeIcon(profile.age)}
                    </div>
                  </div>

                  {/* Información del perfil */}
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">
                    {profile.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <span className="text-sm font-medium">{profile.age} años</span>
                  </div>

                  {/* Efecto hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl"></div>
                </button>

                {/* Botón eliminar */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile._id); }}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-md"
                  title="Eliminar perfil"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}

            {/* Tarjeta para agregar nuevo perfil */}
            <div 
              className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-dashed ${
                showForm 
                  ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'border-slate-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              } transition-all duration-300 hover:shadow-xl cursor-pointer group`}
              onClick={() => !showForm && setShowForm(true)}
            >
              {showForm ? (
                <div className="p-6 w-full h-full">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                    <FaUserEdit className="text-blue-500" />
                    <span>Nuevo perfil</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nombre del perfil
                      </label>
                      <input
                        name="name"
                        placeholder="Ej: Ana, Carlos..."
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Avatar URL (opcional)
                      </label>
                      <input
                        name="avatar"
                        placeholder="https://..."
                        value={formData.avatar}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Edad
                      </label>
                      <input
                        name="age"
                        type="number"
                        min="4"
                        max="120"
                        placeholder="Edad del lector"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCreateProfile(); }}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!formData.name || !formData.age}
                      >
                        <FaPlus /> 
                        <span>Crear perfil</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowForm(false); }}
                        className="flex-1 py-3 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-600 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-8 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="w-24 h-24 mb-4 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
                    <FaPlus className="text-3xl text-blue-400 dark:text-blue-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 text-center">
                    Agregar perfil
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                    Crear nuevo lector
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nota adicional */}
        <div className="text-center max-w-2xl">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Cada perfil mantiene su propia colección de libros, marcadores de lectura, 
            recomendaciones personalizadas y preferencias únicas para una experiencia de lectura adaptada.
          </p>
        </div>
      </main>

      {/* Footer sutil */}
      <footer className="relative z-10 w-full max-w-6xl p-6 text-center border-t border-slate-200/50 dark:border-gray-700/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          BookHive • Tu biblioteca digital personal
        </p>
      </footer>
    </div>
  );
}

export default ProfileSelector;