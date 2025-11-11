/* ============================================
   CHILIX - RUTAS DE PRODUCTOS
   Manejo del catálogo de productos
   ============================================ */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, param, validationResult } = require('express-validator');

// ============================================
// GET /api/productos
// Obtener todos los productos activos
// ============================================
router.get('/', async (req, res) => {
    try {
        const productos = await query(
            'SELECT id, nombre, descripcion, precio, stock, imagen_url, categoria, nivel_picante FROM productos WHERE activo = TRUE ORDER BY nombre',
            []
        );
        
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
        
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos'
        });
    }
});

// ============================================
// GET /api/productos/:id
// Obtener un producto específico
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
        
        const [producto] = await query(
            'SELECT * FROM productos WHERE id = ? AND activo = TRUE',
            [req.params.id]
        );
        
        if (!producto) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: producto
        });
        
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener producto'
        });
    }
});

// ============================================
// GET /api/productos/categoria/:categoria
// Obtener productos por categoría
// ============================================
router.get('/categoria/:categoria', async (req, res) => {
    try {
        const productos = await query(
            'SELECT * FROM productos WHERE categoria = ? AND activo = TRUE',
            [req.params.categoria]
        );
        
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
        
    } catch (error) {
        console.error('Error obteniendo productos por categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos'
        });
    }
});

// ============================================
// POST /api/productos (ADMIN)
// Crear nuevo producto
// ============================================
router.post('/', [
    body('nombre').notEmpty().withMessage('Nombre requerido'),
    body('precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('stock').isInt({ min: 0 }).withMessage('Stock inválido')
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
        
        const { nombre, descripcion, precio, stock, imagen_url, categoria, nivel_picante } = req.body;
        
        const result = await query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, categoria, nivel_picante) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, imagen_url, categoria, nivel_picante]
        );
        
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: {
                id: result.insertId,
                nombre,
                precio
            }
        });
        
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear producto'
        });
    }
});

// ============================================
// PUT /api/productos/:id (ADMIN)
// Actualizar producto
// ============================================
router.put('/:id', [
    param('id').isInt().withMessage('ID inválido'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido')
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
        
        const { nombre, descripcion, precio, stock, imagen_url, categoria, nivel_picante } = req.body;
        
        await query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen_url = ?, categoria = ?, nivel_picante = ? WHERE id = ?',
            [nombre, descripcion, precio, stock, imagen_url, categoria, nivel_picante, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Producto actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar producto'
        });
    }
});

// ============================================
// DELETE /api/productos/:id (ADMIN)
// Desactivar producto (soft delete)
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
        
        await query(
            'UPDATE productos SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Producto desactivado exitosamente'
        });
        
    } catch (error) {
        console.error('Error desactivando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al desactivar producto'
        });
    }
});

// ============================================
// GET /api/productos/stats/populares
// Obtener productos más vendidos
// ============================================
router.get('/stats/populares', async (req, res) => {
    try {
        const populares = await query(
            'SELECT * FROM vista_productos_populares LIMIT 10',
            []
        );
        
        res.json({
            success: true,
            data: populares
        });
        
    } catch (error) {
        console.error('Error obteniendo productos populares:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos populares'
        });
    }
});

module.exports = router;