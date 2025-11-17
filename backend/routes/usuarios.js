// routes/usuarios.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database'); // ✅ IMPORTANTE: pool, no db

// ============================================
// POST /api/usuarios/register - Registrar nuevo usuario
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, telefono, password } = req.body;
        
        console.log('📝 Registrando nuevo usuario:', email);
        
        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos (nombre, email, password)'
            });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Email inválido'
            });
        }
        
        // Verificar que el email no exista
        const [usuariosExistentes] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }
        
        // Encriptar password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insertar usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, telefono, password) VALUES (?, ?, ?, ?)',
            [nombre, email, telefono || null, hashedPassword]
        );
        
        const userId = result.insertId;
        
        console.log('✅ Usuario registrado con ID:', userId);
        
        // Retornar datos del usuario (sin password)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: userId,
                nombre: nombre,
                email: email,
                telefono: telefono
            }
        });
        
    } catch (error) {
        console.error('❌ Error registrando usuario:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================
// POST /api/usuarios/login - Iniciar sesión
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Intento de login:', email);
        
        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y password son requeridos'
            });
        }
        
        // Buscar usuario por email
        const [usuarios] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
            [email]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Email o password incorrectos'
            });
        }
        
        const usuario = usuarios[0];
        
        // Verificar password
        const passwordMatch = await bcrypt.compare(password, usuario.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Email o password incorrectos'
            });
        }
        
        console.log('✅ Login exitoso para:', email);
        
        // Retornar datos del usuario (sin password)
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                fecha_registro: usuario.fecha_registro
            }
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión'
        });
    }
});

// ============================================
// GET /api/usuarios/:id - Obtener usuario específico
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`👤 Obteniendo usuario ID: ${id}`);
        
        const [usuarios] = await pool.query(
            'SELECT id, nombre, email, telefono, fecha_registro, activo FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: usuarios[0]
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo usuario:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al obtener usuario'
        });
    }
});

// ============================================
// GET /api/usuarios - Obtener todos los usuarios (Admin)
// ============================================
router.get('/', async (req, res) => {
    try {
        console.log('👥 Obteniendo todos los usuarios...');
        
        const [usuarios] = await pool.query(
            'SELECT id, nombre, email, telefono, fecha_registro, activo FROM usuarios ORDER BY fecha_registro DESC'
        );
        
        console.log(`✅ Se encontraron ${usuarios.length} usuarios`);
        
        res.json({
            success: true,
            data: usuarios,
            total: usuarios.length
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo usuarios:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al obtener usuarios'
        });
    }
});

// ============================================
// PUT /api/usuarios/:id - Actualizar usuario
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono } = req.body;
        
        console.log(`📝 Actualizando usuario ID: ${id}`);
        
        // Verificar que el usuario existe
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // Actualizar usuario (sin cambiar email ni password)
        await pool.query(
            'UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?',
            [nombre || usuarios[0].nombre, telefono || usuarios[0].telefono, id]
        );
        
        console.log('✅ Usuario actualizado');
        
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error actualizando usuario:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar usuario'
        });
    }
});

// ============================================
// POST /api/usuarios/:id/cambiar-password - Cambiar contraseña
// ============================================
router.post('/:id/cambiar-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password_actual, password_nuevo } = req.body;
        
        console.log(`🔒 Cambiando password para usuario ID: ${id}`);
        
        if (!password_actual || !password_nuevo) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere password actual y nuevo'
            });
        }
        
        // Obtener usuario
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        const usuario = usuarios[0];
        
        // Verificar password actual
        const passwordMatch = await bcrypt.compare(password_actual, usuario.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Password actual incorrecto'
            });
        }
        
        // Encriptar nuevo password
        const hashedPassword = await bcrypt.hash(password_nuevo, 10);
        
        // Actualizar password
        await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, id]);
        
        console.log('✅ Password actualizado');
        
        res.json({
            success: true,
            message: 'Password actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error cambiando password:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar password'
        });
    }
});

// ============================================
// DELETE /api/usuarios/:id - Desactivar usuario
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️ Desactivando usuario ID: ${id}`);
        
        // Verificar que existe
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // Desactivar en lugar de eliminar (soft delete)
        await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
        
        console.log('✅ Usuario desactivado');
        
        res.json({
            success: true,
            message: 'Usuario desactivado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error desactivando usuario:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al desactivar usuario'
        });
    }
});

module.exports = router;