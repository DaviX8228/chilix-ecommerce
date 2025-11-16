// config/database.js
const mysql = require('mysql2');
require('dotenv').config();

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
    connectTimeout: 60000,
    ssl: {
        rejectUnauthorized: false
    }
}).promise(); // Hacemos que el pool sea Promise-based desde el inicio

// Función 1: Ejecutar una consulta simple (exportada como 'query')
const query = async (sql, params) => {
    return pool.query(sql, params);
};

// Función 2: Manejar transacciones (exportada como 'transaction')
const transaction = async (callback) => {
    let connection;
    try {
        // 1. Obtener conexión
        connection = await pool.getConnection();
        // 2. Iniciar transacción
        await connection.beginTransaction();

        // 3. Ejecutar las operaciones de la transacción
        // El callback recibe la conexión para que ejecute sus queries
        const result = await callback(connection);

        // 4. Confirmar (commit)
        await connection.commit();
        return result;

    } catch (error) {
        // 5. Revertir (rollback) si hay error
        if (connection) {
            await connection.rollback();
        }
        // Re-lanzar el error para que sea capturado por la ruta de pedidos
        throw error;
    } finally {
        // 6. Liberar la conexión
        if (connection) {
            connection.release();
        }
    }
};

// Función para testear la conexión
const testConnection = async () => {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log(' Conexión a la base de datos exitosa');
        return true;
    } catch (error) {
        console.error(' Error al conectar a la base de datos:', error.message);
        return false;
    }
};

// ============================================
// EXPORTACIÓN
// ============================================

module.exports = {
    query,       // Para consultas simples (Registro, Login, etc.)
    transaction, // Para la ruta de Pedidos
    testConnection
};