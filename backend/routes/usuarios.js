/* ============================================
   CHILIX - RUTAS DE USUARIOS
   Registro, login y gestión de usuarios
   ============================================ */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// ============================================
// POST /api/usuarios/register
// Registrar nuevo usuario
// ============================================
router.post('/register', [
    body('nombre').notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
    body('telefono').optional().isMobilePhone('es-MX').withMessage('Teléfono inválido')
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
        
        const { nombre, email, telefono, password } = req.body;
        
        // Verificar si el email ya existe
        const [existingUser] = await query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Este email ya está registrado'
            });
        }
        
        // Encriptar password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar usuario
        const result = await query(
            'INSERT INTO usuarios (nombre, email, telefono, password) VALUES (?, ?, ?, ?)',
            [nombre, email, telefono, hashedPassword]
        );
        
        // Generar token JWT
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Guardar sesión
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        await query(
            'INSERT INTO sesiones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)',
            [result.insertId, token, expiresAt]
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: result.insertId,
                nombre,
                email,
                token
            }
        });
        
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario'
        });
    }
});

// ============================================
// POST /api/usuarios/login
// Iniciar sesión
// ============================================
router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Password requerido')
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
        
        const { email, password } = req.body;
        
        // Buscar usuario
        const [user] = await query(
            'SELECT id, nombre, email, password, activo FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }
        
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                error: 'Usuario desactivado'
            });
        }
        
        // Verificar password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Guardar sesión
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        await query(
            'INSERT INTO sesiones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );
        
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                token
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión'
        });
    }
});

// ============================================
// POST /api/usuarios/logout
// Cerrar sesión
// ============================================
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }
        
        // Desactivar sesión
        await query(
            'UPDATE sesiones SET activa = FALSE WHERE token = ?',
            [token]
        );
        
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
        
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cerrar sesión'
        });
    }
});

// ============================================
// GET /api/usuarios/perfil
// Obtener perfil del usuario autenticado
// ============================================
router.get('/perfil', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }
        
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que la sesión esté activa
        const [sesion] = await query(
            'SELECT activa FROM sesiones WHERE token = ? AND fecha_expiracion > NOW()',
            [token]
        );
        
        if (!sesion || !sesion.activa) {
            return res.status(401).json({
                success: false,
                error: 'Sesión inválida o expirada'
            });
        }
        
        // Obtener datos del usuario
        const [user] = await query(
            'SELECT id, nombre, email, telefono, fecha_registro FROM usuarios WHERE id = ?',
            [decoded.id]
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }
        
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener perfil'
        });
    }
});

// ============================================
// GET /api/usuarios/:id/pedidos
// Obtener pedidos de un usuario
// ============================================
router.get('/:id/pedidos', async (req, res) => {
    try {
        const pedidos = await query(
            `SELECT p.*, 
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'producto_id', dp.producto_id,
                            'nombre', pr.nombre,
                            'cantidad', dp.cantidad,
                            'precio_unitario', dp.precio_unitario,
                            'subtotal', dp.subtotal,
                            'personalizaciones', dp.personalizaciones
                        )
                    ) 
                    FROM detalle_pedidos dp
                    JOIN productos pr ON dp.producto_id = pr.id
                    WHERE dp.pedido_id = p.id
                    ) as items
             FROM pedidos p
             WHERE p.usuario_id = ?
             ORDER BY p.fecha_pedido DESC`,
            [req.params.id]
        );
        
        res.json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
        
    } catch (error) {
        console.error('Error obteniendo pedidos del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pedidos'
        });
    }
});

module.exports = router;