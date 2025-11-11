/* ============================================
   CHILIX - RUTAS DE PEDIDOS
   Creación y gestión de pedidos
   ============================================ */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');
const { body, param, validationResult } = require('express-validator');

// ============================================
// POST /api/pedidos
// Crear nuevo pedido
// ============================================
router.post('/', [
    body('usuario_id').isInt().withMessage('usuario_id inválido'),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
    body('items.*.producto_id').isInt().withMessage('producto_id inválido'),
    body('items.*.cantidad').isInt({ min: 1 }).withMessage('cantidad inválida'),
    body('items.*.precio_unitario').isFloat({ min: 0 }).withMessage('precio inválido')
], async (req, res) => {
    try {
        // Validar
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { usuario_id, items, notas } = req.body;
        
        // Usar transacción para asegurar integridad
        const result = await transaction(async (connection) => {
            // Calcular totales
            let subtotal = 0;
            let extras = 0;
            
            for (const item of items) {
                subtotal += item.precio_unitario * item.cantidad;
                
                // Calcular extras de personalizaciones
                if (item.personalizaciones) {
                    if (item.personalizaciones.chamoy) extras += 5 * item.cantidad;
                    if (item.personalizaciones.miguelito) extras += 5 * item.cantidad;
                }
            }
            
            const total = subtotal + extras;
            
            // Generar número de orden único
            const numero_orden = `CH${String(Date.now()).slice(-6)}`;
            
            // Insertar pedido
            const [pedidoResult] = await connection.execute(
                'INSERT INTO pedidos (usuario_id, numero_orden, subtotal, extras, total, notas) VALUES (?, ?, ?, ?, ?, ?)',
                [usuario_id, numero_orden, subtotal, extras, total, notas]
            );
            
            const pedido_id = pedidoResult.insertId;
            
            // Insertar items y actualizar stock
            for (const item of items) {
                // Verificar stock disponible
                const [producto] = await connection.execute(
                    'SELECT stock FROM productos WHERE id = ? FOR UPDATE',
                    [item.producto_id]
                );
                
                if (!producto || producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para producto ${item.producto_id}`);
                }
                
                // Insertar detalle del pedido
                const itemSubtotal = item.precio_unitario * item.cantidad;
                
                await connection.execute(
                    'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, personalizaciones) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        pedido_id,
                        item.producto_id,
                        item.cantidad,
                        item.precio_unitario,
                        itemSubtotal,
                        JSON.stringify(item.personalizaciones || {})
                    ]
                );
                
                // Actualizar stock
                await connection.execute(
                    'UPDATE productos SET stock = stock - ? WHERE id = ?',
                    [item.cantidad, item.producto_id]
                );
            }
            
            return { pedido_id, numero_orden, total };
        });
        
        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: result
        });
        
    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al crear pedido'
        });
    }
});

// ============================================
// GET /api/pedidos/:id
// Obtener detalle de un pedido
// ============================================
router.get('/:id', [
    param('id').isInt().withMessage('ID inválido')
], async (req, res) => {
    try {
        // Validar
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        // Obtener pedido
        const [pedido] = await query(
            `SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono as cliente_telefono
             FROM pedidos p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.id = ?`,
            [req.params.id]
        );
        
        if (!pedido) {
            return res.status(404).json({
                success: false,
                error: 'Pedido no encontrado'
            });
        }
        
        // Obtener items del pedido
        const items = await query(
            `SELECT dp.*, pr.nombre as producto_nombre
             FROM detalle_pedidos dp
             JOIN productos pr ON dp.producto_id = pr.id
             WHERE dp.pedido_id = ?`,
            [req.params.id]
        );
        
        // Parsear personalizaciones JSON
        items.forEach(item => {
            if (item.personalizaciones) {
                item.personalizaciones = JSON.parse(item.personalizaciones);
            }
        });
        
        pedido.items = items;
        
        res.json({
            success: true,
            data: pedido
        });
        
    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedido'
        });
    }
});

// ============================================
// GET /api/pedidos
// Obtener todos los pedidos (con filtros)
// ============================================
router.get('/', async (req, res) => {
    try {
        const { estado, usuario_id, desde, hasta } = req.query;
        
        let sql = `
            SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];
        
        if (estado) {
            sql += ' AND p.estado = ?';
            params.push(estado);
        }
        
        if (usuario_id) {
            sql += ' AND p.usuario_id = ?';
            params.push(usuario_id);
        }
        
        if (desde) {
            sql += ' AND p.fecha_pedido >= ?';
            params.push(desde);
        }
        
        if (hasta) {
            sql += ' AND p.fecha_pedido <= ?';
            params.push(hasta);
        }
        
        sql += ' ORDER BY p.fecha_pedido DESC';
        
        const pedidos = await query(sql, params);
        
        res.json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
        
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedidos'
        });
    }
});

// ============================================
// PUT /api/pedidos/:id/estado
// Actualizar estado de un pedido
// ============================================
router.put('/:id/estado', [
    param('id').isInt().withMessage('ID inválido'),
    body('estado').isIn(['pendiente', 'preparando', 'listo', 'entregado', 'cancelado']).withMessage('Estado inválido')
], async (req, res) => {
    try {
        // Validar
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { estado } = req.body;
        
        await query(
            'UPDATE pedidos SET estado = ? WHERE id = ?',
            [estado, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Estado actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar estado'
        });
    }
});

// ============================================
// DELETE /api/pedidos/:id
// Cancelar un pedido
// ============================================
router.delete('/:id', [
    param('id').isInt().withMessage('ID inválido')
], async (req, res) => {
    try {
        // Validar
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        // Usar transacción para devolver el stock
        await transaction(async (connection) => {
            // Obtener items del pedido
            const items = await connection.execute(
                'SELECT producto_id, cantidad FROM detalle_pedidos WHERE pedido_id = ?',
                [req.params.id]
            );
            
            // Devolver stock
            for (const item of items[0]) {
                await connection.execute(
                    'UPDATE productos SET stock = stock + ? WHERE id = ?',
                    [item.cantidad, item.producto_id]
                );
            }
            
            // Marcar pedido como cancelado
            await connection.execute(
                'UPDATE pedidos SET estado = "cancelado" WHERE id = ?',
                [req.params.id]
            );
        });
        
        res.json({
            success: true,
            message: 'Pedido cancelado exitosamente'
        });
        
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cancelar pedido'
        });
    }
});

// ============================================
// GET /api/pedidos/stats/resumen
// Obtener estadísticas de pedidos
// ============================================
router.get('/stats/resumen', async (req, res) => {
    try {
        // Total de pedidos
        const [totales] = await query(
            `SELECT 
                COUNT(*) as total_pedidos,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'preparando' THEN 1 ELSE 0 END) as preparando,
                SUM(CASE WHEN estado = 'listo' THEN 1 ELSE 0 END) as listos,
                SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregados,
                SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
                SUM(total) as ingresos_totales
             FROM pedidos`,
            []
        );
        
        // Pedidos del día
        const [hoy] = await query(
            `SELECT COUNT(*) as pedidos_hoy, SUM(total) as ingresos_hoy
             FROM pedidos
             WHERE DATE(fecha_pedido) = CURDATE()`,
            []
        );
        
        res.json({
            success: true,
            data: {
                ...totales,
                ...hoy
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
});

module.exports = router;