/* ============================================
   CHILIX - SERVIDOR PRINCIPAL
   Backend con Node.js + Express + MySQL
   Fundado por David Velazquez - CECyT 8
   ============================================ */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad con Helmet
app.use(helmet());

// CORS
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting (limitar requests por IP)
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
});
app.use('/api/', limiter);

// Servir archivos estáticos del frontend
app.use(express.static('../frontend'));

// ============================================
// RUTAS API
// ============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        mensaje: '🌶️ Bienvenido a ChiliX API',
        version: '1.0.0',
        fundador: 'David Velázquez',
        institucion: 'CECyT 8 "Narciso Bassols"',
        endpoints: {
            productos: '/api/productos',
            usuarios: '/api/usuarios',
            pedidos: '/api/pedidos'
        }
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        database: dbConnected ? 'conectada' : 'desconectada',
        timestamp: new Date().toISOString()
    });
});

// Rutas principales
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
    try {
        // Testear conexión a la base de datos
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            console.log('💡 Verifica tu archivo .env y que MySQL esté corriendo');
            process.exit(1);
        }
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🌶️  ===================================');
            console.log('     ChiliX Backend Iniciado');
            console.log('   ===================================');
            console.log(`\n   🚀 Servidor: http://localhost:${PORT}`);
            console.log(`   📊 API: http://localhost:${PORT}/api`);
            console.log(`   💾 Base de datos: ${process.env.DB_NAME}`);
            console.log(`   🏫 CECyT 8 "Narciso Bassols"`);
            console.log(`   👨‍💻 Fundador: David Velázquez\n`);
            console.log('   Endpoints disponibles:');
            console.log('   • GET  /api/productos');
            console.log('   • POST /api/usuarios/register');
            console.log('   • POST /api/usuarios/login');
            console.log('   • POST /api/pedidos\n');
            console.log('   ===================================\n');
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejar cierre graceful
process.on('SIGTERM', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit(0);
});

// Iniciar
startServer();