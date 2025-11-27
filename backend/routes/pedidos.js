// routes/pedidos.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); 

// ============================================
// GET /api/pedidos - Obtener todos los pedidos
// ============================================
router.get('/', async (req, res) => {
    try {
        console.log(' Obteniendo pedidos...');
        
        // CORRECTO: Usar pool.query() con await
        const [pedidos] = await pool.query(`
            SELECT 
                p.*,
                u.nombre as cliente_nombre,
                u.email as cliente_email
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_pedido DESC
        `);
        
        console.log(` Se encontraron ${pedidos.length} pedidos`);
        
        res.json({
            success: true,
            data: pedidos,
            total: pedidos.length
        });
        
    } catch (error) {
        console.error(' Error obteniendo pedidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedidos',
            details: error.message
        });
    }
});

// ============================================
// POST /api/pedidos - Crear nuevo pedido
// ============================================
router.post('/', async (req, res) => {
    try {
        const { usuario_id, items, notas } = req.body;
        
        console.log('Creando nuevo pedido...');
        console.log('Usuario:', usuario_id);
        console.log('Items:', items?.length);
        
        // Validaciones básicas
        if (!usuario_id || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos (usuario_id, items)'
            });
        }
        
        // Calcular totales
        let subtotal = 0;
        let extras = 0;
        
        items.forEach(item => {
            subtotal += item.precio_unitario * item.cantidad;
            
            // Calcular extras de personalizaciones
            if (item.personalizaciones) {
                if (item.personalizaciones.chamoy) extras += 5 * item.cantidad;
                if (item.personalizaciones.miguelito) extras += 5 * item.cantidad;
            }
        });
        
        const total = subtotal + extras;
        
        // Generar número de orden único
        const numero_orden = 'CH' + Date.now().toString().slice(-6);
        
        // Iniciar transacción
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 1. Insertar pedido
            const [resultPedido] = await connection.query(
                `INSERT INTO pedidos (usuario_id, numero_orden, subtotal, extras, total, notas) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [usuario_id, numero_orden, subtotal, extras, total, notas || '']
            );
            
            const pedido_id = resultPedido.insertId;
            console.log('✅ Pedido creado con ID:', pedido_id);
            
            // 2. Insertar items del pedido
            for (const item of items) {
                const item_subtotal = item.precio_unitario * item.cantidad;
                
                await connection.query(
                    `INSERT INTO detalle_pedidos 
                     (pedido_id, producto_id, cantidad, precio_unitario, subtotal, personalizaciones) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        pedido_id,
                        item.producto_id,
                        item.cantidad,
                        item.precio_unitario,
                        item_subtotal,
                        JSON.stringify(item.personalizaciones || {})
                    ]
                );
                
                // 3. Actualizar stock
                await connection.query(
                    'UPDATE productos SET stock = stock - ? WHERE id = ?',
                    [item.cantidad, item.producto_id]
                );
            }
            
            // Commit de la transacción
            await connection.commit();
            console.log('Transacción completada exitosamente');
            
            res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: {
                    pedido_id: pedido_id,
                    numero_orden: numero_orden,
                    total: total
                }
            });
            
        } catch (error) {
            // Rollback en caso de error
            await connection.rollback();
            console.error('Error en transacción, haciendo rollback');
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear pedido',
            details: error.message
        });
    }
});

// ============================================
// GET /api/pedidos/:id - Obtener pedido específico
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener pedido con sus items
        const [pedidos] = await pool.query(
            `SELECT 
                p.*,
                u.nombre as cliente_nombre,
                u.email as cliente_email,
                u.telefono as cliente_telefono
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?`,
            [id]
        );
        
        if (pedidos.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pedido no encontrado'
            });
        }
        
        // Obtener items del pedido
        const [items] = await pool.query(
            `SELECT 
                dp.*,
                pr.nombre as producto_nombre
            FROM detalle_pedidos dp
            LEFT JOIN productos pr ON dp.producto_id = pr.id
            WHERE dp.pedido_id = ?`,
            [id]
        );
        
        const pedido = {
            ...pedidos[0],
            items: items.map(item => ({
                ...item,
                personalizaciones: typeof item.personalizaciones === 'string' 
                    ? JSON.parse(item.personalizaciones) 
                    : item.personalizaciones
            }))
        };
        
        res.json({
            success: true,
            data: pedido
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo pedido:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedido'
        });
    }
});

module.exports = router;