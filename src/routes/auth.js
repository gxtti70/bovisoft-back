const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ¡AQUÍ ESTÁ LA SOLUCIÓN! Importamos el middleware de seguridad
const verificarToken = require('../middlewares/auth.middleware');

// Importamos la librería de Google y configuramos tu Client ID
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '537987545782-adbfh7v5k8osdt8oluq6g7beg73dav3s.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Una llave secreta para crear los "carnets virtuales" (JWT)
const JWT_SECRET = process.env.JWT_SECRET || 'bovisoft_llave_super_secreta_2026';

// --- 1. RUTA PARA CREAR CUENTA (REGISTRO TRADICIONAL) ---
router.post('/registro', async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const usuarioExistente = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ ok: false, error: "Este correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = await pool.query(
            "INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo, nombre_hacienda",
            [nombre, correo, passwordEncriptada]
        );

        res.status(201).json({
            ok: true,
            mensaje: "¡Cuenta creada con éxito! Ya puedes iniciar sesión.",
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error("❌ Error en Registro:", error.message);
        res.status(500).json({ ok: false, error: "Error en el servidor al registrar" });
    }
});

// --- 2. RUTA PARA INICIAR SESIÓN (LOGIN TRADICIONAL) ---
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const usuario = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
        
        if (usuario.rows.length === 0) {
            return res.status(401).json({ ok: false, error: "Correo o contraseña incorrectos" });
        }

        const userDB = usuario.rows[0];

        const passwordValida = await bcrypt.compare(password, userDB.password);
        
        if (!passwordValida) {
            return res.status(401).json({ ok: false, error: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: userDB.id, nombre: userDB.nombre, correo: userDB.correo }, 
            JWT_SECRET, 
            { expiresIn: '8h' } 
        );

        res.json({
            ok: true,
            mensaje: "¡Bienvenido a Bovisoft!",
            token: token,
            usuario: { 
                id: userDB.id, 
                nombre: userDB.nombre, 
                correo: userDB.correo, 
                nombre_hacienda: userDB.nombre_hacienda // <-- Agregado para el frontend
            }
        });

    } catch (error) {
        console.error("❌ Error en Login:", error.message);
        res.status(500).json({ ok: false, error: "Error en el servidor al iniciar sesión" });
    }
});

// --- 3. RUTA PARA INICIAR SESIÓN CON GOOGLE ---
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let usuario = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [email]);
        let userDB;

        if (usuario.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);

            const nuevoUsuario = await pool.query(
                "INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo, nombre_hacienda",
                [name, email, randomPassword]
            );
            userDB = nuevoUsuario.rows[0];
        } else {
            userDB = usuario.rows[0];
        }

        const jwtToken = jwt.sign(
            { id: userDB.id, nombre: userDB.nombre, correo: userDB.correo }, 
            JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.json({
            ok: true,
            mensaje: "¡Autenticado con Google exitosamente!",
            token: jwtToken,
            usuario: { 
                id: userDB.id, 
                nombre: userDB.nombre, 
                correo: userDB.correo, 
                nombre_hacienda: userDB.nombre_hacienda // <-- Agregado para el frontend
            }
        });

    } catch (error) {
        console.error("Error verificando token de Google:", error.message);
        res.status(401).json({ ok: false, error: "Token de Google inválido o expirado" });
    }
});

// --- RUTA PARA ACTUALIZAR EL PERFIL Y NOMBRE DE HACIENDA ---
router.put('/perfil', verificarToken, async (req, res) => {
    const { nombre, nombre_hacienda } = req.body;

    try {
        const resultado = await pool.query(
            "UPDATE usuarios SET nombre = $1, nombre_hacienda = $2 WHERE id = $3 RETURNING id, nombre, correo, nombre_hacienda",
            [nombre, nombre_hacienda, req.usuario.id]
        );

        res.json({
            ok: true,
            mensaje: "Perfil actualizado correctamente",
            usuario: resultado.rows[0]
        });
    } catch (error) {
        console.error("❌ Error actualizando perfil:", error.message);
        res.status(500).json({ ok: false, error: "Error al actualizar en la base de datos" });
    }
});

// --- 4. RUTA PARA CERRAR SESIÓN ---
router.post('/logout', (req, res) => {
    res.json({ ok: true, mensaje: "Sesión cerrada correctamente" });
});

module.exports = router;