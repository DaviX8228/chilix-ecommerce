// routes/productos.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // pool, no db

// ============================================
// GET /api/productos - Obtener todos los productos
// ============================================
router.get('/', async (req, res) => {
    try {
        console.log('📦 Obteniendo productos...');
        
        // Use pool.query() con await pq me dio flojera XD
        const [productos] = await pool.query(`
            SELECT 
                id,
                nombre,
                descripcion,
                precio,
                stock,
                imagen_url,
                categoria,
                nivel_picante,
                activo,
                fecha_creacion
            FROM productos 
            WHERE activo = TRUE
            ORDER BY nombre
        `);
        
        console.log(`Se encontraron ${productos.length} productos`);
        
        res.json({
            success: true,
            data: productos,
            total: productos.length
        });
        
    } catch (error) {
        console.error('Error obteniendo productos:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================
// GET /api/productos/:id - Obtener producto específico
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Obteniendo producto ID: ${id}`);
        
        const [productos] = await pool.query(
            'SELECT * FROM productos WHERE id = ? AND activo = TRUE',
            [id]
        );
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        console.log('Producto encontrado:', productos[0].nombre);
        
        res.json({
            success: true,
            data: productos[0]
        });
        
    } catch (error) {
        console.error('Error obteniendo producto:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al obtener producto'
        });
    }
});

// ============================================
// POST /api/productos - Crear nuevo producto (Admin)
// ============================================
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, nivel_picante } = req.body;
        
        console.log('Creando nuevo producto:', nombre);
        
        // Validaciones básicas
        if (!nombre || !precio) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos (nombre, precio)'
            });
        }
        
        const [result] = await pool.query(
            `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, nivel_picante) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, descripcion || '', precio, stock || 0, categoria || 'clasico', nivel_picante || 3]
        );
        
        console.log('Producto creado con ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: {
                id: result.insertId,
                nombre: nombre
            }
        });
        
    } catch (error) {
        console.error('Error creando producto:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al crear producto'
        });
    }
});

// ============================================
// PUT /api/productos/:id - Actualizar producto (Admin)
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria, nivel_picante, activo } = req.body;
        
        console.log(`Actualizando producto ID: ${id}`);
        
        // Verificar que el producto existe
        const [productos] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        // Actualizar producto
        await pool.query(
            `UPDATE productos 
             SET nombre = ?, descripcion = ?, precio = ?, stock = ?, 
                 categoria = ?, nivel_picante = ?, activo = ?
             WHERE id = ?`,
            [
                nombre || productos[0].nombre,
                descripcion || productos[0].descripcion,
                precio || productos[0].precio,
                stock !== undefined ? stock : productos[0].stock,
                categoria || productos[0].categoria,
                nivel_picante !== undefined ? nivel_picante : productos[0].nivel_picante,
                activo !== undefined ? activo : productos[0].activo,
                id
            ]
        );
        
        console.log('Producto actualizado');
        
        res.json({
            success: true,
            message: 'Producto actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('Error actualizando producto:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar producto'
        });
    }
});

// ============================================
// DELETE /api/productos/:id - Eliminar (desactivar) producto (Admin)
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Desactivando producto ID: ${id}`);
        
        // Verificar que existe
        const [productos] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        // Desactivar en lugar de eliminar (soft delete)
        await pool.query('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
        
        console.log('Producto desactivado');
        
        res.json({
            success: true,
            message: 'Producto desactivado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando producto:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar producto'
        });
    }
});

// ============================================
// GET /api/productos/categoria/:categoria - Productos por categoría
// ============================================
router.get('/categoria/:categoria', async (req, res) => {
    try {
        const { categoria } = req.params;
        
        console.log(`Obteniendo productos de categoría: ${categoria}`);
        
        const [productos] = await pool.query(
            'SELECT * FROM productos WHERE categoria = ? AND activo = TRUE',
            [categoria]
        );
        
        res.json({
            success: true,
            data: productos,
            total: productos.length
        });
        
    } catch (error) {
        console.error('Error obteniendo productos por categoría:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos'
        });
    }
});

module.exports = router;