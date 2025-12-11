import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import libro from '../assets/libro.png';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#135ae8] via-[#6a11cb] to-[#29192c] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Books */}
      <div className="absolute top-20 left-10 w-8 h-12 bg-white/20 rounded-lg transform rotate-12 animate-float shadow-lg"></div>
      <div className="absolute top-40 right-20 w-10 h-14 bg-yellow-300/30 rounded-lg transform -rotate-6 animate-float delay-1000 shadow-lg"></div>
      <div className="absolute bottom-40 left-20 w-9 h-13 bg-green-300/30 rounded-lg transform rotate-45 animate-float delay-1500 shadow-lg"></div>
      <div className="absolute bottom-20 right-16 w-7 h-11 bg-pink-300/30 rounded-lg transform -rotate-12 animate-float delay-2000 shadow-lg"></div>

      <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 py-12 min-h-screen">
        {/* Main Content */}
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Logo/Brand */}
          <div className="mb-8 animate-bounce-slow">
            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
              <span className="text-3xl filter drop-shadow">📚</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            Book<span className="text-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Hive</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-8 font-light leading-relaxed drop-shadow-lg">
            Tu biblioteca personalizada en la nube. 
            <span className="block text-yellow-200 font-medium mt-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Descubre, organiza y crea tu mundo literario
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="group">
              <button className="bg-white text-blue-600 hover:bg-blue-50 text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl flex items-center gap-3 min-w-[200px] justify-center border border-white/30">
                <span>Comienza Ahora</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">🚀</span>
              </button>
            </Link>
            <Link to="/login" className="group">
              <button className="bg-transparent border-2 border-white text-white hover:bg-white/20 text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm flex items-center gap-3 min-w-[200px] justify-center shadow-2xl hover:shadow-3xl">
                <span>Iniciar Sesión</span>
                <span className="group-hover:scale-125 transition-transform duration-300">🔑</span>
              </button>
            </Link>
          </div>

          {/* Features Card */}
          <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-5xl w-full mx-auto shadow-2xl transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Features List */}
              <div className="text-left space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text drop-shadow-sm">
                    ✨ Características Exclusivas
                  </span>
                </h2>
                
                <div className="space-y-4">
                  {[
                    { icon: '👤', title: 'Perfiles Personalizados', desc: 'Crea perfiles únicos según edad e intereses' },
                    { icon: '⭐', title: 'Sistema de Favoritos', desc: 'Organiza tus libros favoritos por usuario y perfil' },
                    { icon: '🔍', title: 'Recomendaciones Inteligentes', desc: 'Conectado con Google Books API' },
                    { icon: '📖', title: 'Creador de Libros', desc: 'Crea y personaliza tus propios libros' },
                    { icon: '🛡️', title: 'Seguridad Total', desc: 'Rutas protegidas y datos seguros' }
                  ].map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/20 backdrop-blur-sm"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg group-hover:text-yellow-200 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustration with Transparent Background Effect */}
              <div className="flex justify-center items-center">
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:from-yellow-400/30 group-hover:via-blue-400/30 group-hover:to-purple-400/30 transition-all duration-1000 animate-pulse"></div>
                  
                  {/* Main Image Container with Transparent Background */}
                  <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                    <div className="relative">
                      <img
                        src={libro}
                        alt="Ilustración de libros y lectura"
                        className="w-80 h-80 object-contain animate-float-slow filter drop-shadow-2xl group-hover:drop-shadow-3xl transition-all duration-500"
                        style={{
                          filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3))',
                          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
                        }}
                      />
                      
                      {/* Enhanced Shadow Effect */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full blur-sm transform translate-y-4 scale-110"
                        style={{
                          WebkitMaskImage: 'url(' + libro + ')',
                          maskImage: 'url(' + libro + ')',
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat'
                        }}
                      ></div>
                    </div>
                    
                    {/* Floating Particles */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400/60 rounded-full animate-ping shadow-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400/60 rounded-full animate-ping delay-700 shadow-lg"></div>
                    <div className="absolute top-1/2 -right-3 w-3 h-3 bg-green-400/60 rounded-full animate-ping delay-300 shadow-lg"></div>
                    <div className="absolute bottom-1/3 -left-3 w-5 h-5 bg-purple-400/60 rounded-full animate-ping delay-1000 shadow-lg"></div>
                  </div>
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 group-hover:border-blue-400/50 transition-all duration-1000 animate-spin-slow"></div>
                  
                  {/* Additional Glow Layers */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Account */}
          <div className={`mt-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md mx-auto transform transition-all duration-1000 delay-500 shadow-2xl hover:shadow-3xl hover:scale-105 cursor-pointer ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="text-white text-center">
              <p className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <span className="text-xl">🧪</span>
                Cuenta Demo
              </p>
              <div className="space-y-2 text-sm bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="flex justify-between items-center">
                  <strong className="text-yellow-200">Email:</strong> 
                  <span className="font-mono bg-black/20 px-2 py-1 rounded">demo@bookhive.com</span>
                </p>
                <p className="flex justify-between items-center">
                  <strong className="text-yellow-200">Contraseña:</strong> 
                  <span className="font-mono bg-black/20 px-2 py-1 rounded">123456</span>
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
            {[
              { number: '10K+', label: 'Libros', color: 'from-blue-400 to-cyan-400', icon: '📚' },
              { number: '5K+', label: 'Usuarios', color: 'from-purple-400 to-pink-400', icon: '👥' },
              { number: '99%', label: 'Satisfacción', color: 'from-green-400 to-emerald-400', icon: '⭐' },
              { number: '24/7', label: 'Disponible', color: 'from-orange-400 to-red-400', icon: '🕒' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-white text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 shadow-lg hover:shadow-2xl group cursor-pointer"
              >
                <div className="text-2xl mb-2 opacity-80 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Features Banner */}
          <div className={`mt-12 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6 max-w-4xl mx-auto transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white text-left">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">🎯 ¿Listo para comenzar tu aventura literaria?</h3>
                <p className="text-white/80">Únete a nuestra comunidad de lectores apasionados</p>
              </div>
              <Link to="/register">
                <button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25 flex items-center gap-2">
                  <span>Empezar Ahora</span>
                  <span className="text-lg">✨</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.02); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}