// config.js
// Configuración de la API según el entorno

// Detectar si estamos en producción (Vercel) o desarrollo (local) :)
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Configuración de la URL del back 
const CONFIG = {
    // URL del backend en producción (Render)
    API_URL: isProduction 
        ? 'https://chilix-backend.onrender.com' 
        : 'http://localhost:3000',
    
    // Información de la app
    APP_NAME: 'ChiliX',
    VERSION: '1.0.0',
    
    // Info útil
    ENTORNO: isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'
};

// Log para debugging (solo en desarrollo)
if (!isProduction) {
    console.log(' ChiliX Config:', CONFIG);
}

// Hacer disponible globalmente
window.CONFIG = CONFIG;