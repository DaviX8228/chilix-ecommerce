/* ============================================
   CHILIX - SERVIDOR PRINCIPAL (RENDER)
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
// CONFIGURACIÓN PARA RENDER (IMPORTANTE)
// ============================================

// Trust proxy - NECESARIO para Render
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad con Helmet
app.use(helmet());

// CORS - Permitir TODOS los orígenes (TEMPORAL PARA DEBUG)
app.use(cors({
    origin: '*', // Permitir todos temporalmente
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting (limitar requests por IP) - ARREGLADO PARA RENDER
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requests por ventana
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Handler personalizado para evitar el error
    handler: (req, res) => {
        res.status(429).json({
            error: 'Demasiadas peticiones, intenta de nuevo más tarde'
        });
    }
});
app.use('/api/', limiter);

// ============================================
// RUTAS API
// ============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Bienvenido a ChiliX API',
        version: '1.0.0',
        fundador: 'David Velázquez',
        institucion: 'CECyT 8 "Narciso Bassols"',
        status: 'Online',
        endpoints: {
            productos: '/api/productos',
            usuarios: '/api/usuarios',
            pedidos: '/api/pedidos',
            health: '/api/health'
        }
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            status: 'ok',
            database: dbConnected ? 'conectada' : 'desconectada',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'error',
            error: error.message
        });
    }
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
        path: req.path,
        method: req.method
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
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
        console.log('Iniciando servidor ChiliX...');
        console.log('Environment:', process.env.NODE_ENV || 'production');
        
        // Testear conexión a la base de datos
        console.log('Verificando conexión a base de datos...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('No se pudo conectar a la base de datos');
            console.log('Verifica tus variables de entorno en Render');
            // No hacemos exit para que Render no crashee
        } else {
            console.log('Base de datos conectada exitosamente');
        }
        
        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n ===================================');
            console.log('     ChiliX Backend LIVE en Render');
            console.log('   ===================================');
            console.log(`\n  Servidor corriendo en puerto ${PORT}`);
            console.log(`    API disponible en /api`);
            console.log(`    Base de datos: ${dbConnected ? 'Conectada' : 'Desconectada'}`);
            console.log(`    CECyT 8 "Narciso Bassols"`);
            console.log(`    Fundador: David Velázquez\n`);
            console.log('   ===================================\n');
        });
        
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejar cierre graceful
process.on('SIGTERM', () => {
    console.log('\n👋 Cerrando servidor gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit(0);
});

// Iniciar
startServer();