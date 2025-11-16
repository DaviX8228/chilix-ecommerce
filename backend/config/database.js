/* ============================================
   CHILIX - CONFIGURACIÓN DE BASE DE DATOS
   Conexión a MySQL usando mysql2
   ============================================ */

const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'chilix_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Promisify para usar async/await
const promisePool = pool.promise();

// Función para testear la conexión
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
};

// Función helper para ejecutar queries
const query = async (sql, params) => {
    try {
        const [results] = await promisePool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('❌ Error en query:', error.message);
        throw error;
    }
};

// Función helper para transacciones
const transaction = async (callback) => {
    const connection = await promisePool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    pool,
    promisePool,
    testConnection,
    query,
    transaction
};