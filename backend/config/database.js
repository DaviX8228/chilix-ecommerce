// config/database.js
const mysql = require('mysql2');
require('dotenv').config();

console.log('🔧 Configurando conexión a base de datos...');
console.log('📍 Host:', process.env.DB_HOST);
console.log('📍 Port:', process.env.DB_PORT);
console.log('📍 User:', process.env.DB_USER);
console.log('📍 Database:', process.env.DB_NAME);

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 segundos para conexiones en la nube
    // SSL para conexiones seguras (AIVEN lo requiere)
    ssl: process.env.DB_HOST?.includes('aivencloud.com') ? {
        rejectUnauthorized: false
    } : undefined
});

// Promisificar el pool para usar async/await
const promisePool = pool.promise();

// Función para testear la conexión
const testConnection = async () => {
    try {
        console.log('🔍 Probando conexión a la base de datos...');
        const [rows] = await promisePool.query('SELECT 1 as test');
        console.log('✅ Conexión exitosa! Test:', rows[0].test);
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:');
        console.error('   Código:', error.code);
        console.error('   Mensaje:', error.message);
        console.error('   Host:', process.env.DB_HOST);
        return false;
    }
};

// Manejar errores del pool
pool.on('error', (err) => {
    console.error('❌ Error en el pool de conexiones:', err);
});

// Exportar tanto el pool promisificado como la función de test
module.exports = {
    pool: promisePool,
    testConnection,
    // También exportar el pool normal por si se necesita
    rawPool: pool
};

console.log('✅ Pool de conexiones MySQL creado');