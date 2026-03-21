const express = require('express');
const cors = require('cors');
const rutasAnimales = require('./routes/animales');
const rutasAuth = require('./routes/auth'); // <-- Importamos la ruta de seguridad
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARES DE SEGURIDAD Y FORMATO (DEBEN IR PRIMERO) ---
app.use(cors()); // <-- El portero que deja pasar a Vue (Debe estar arriba)
app.use(express.json()); // <-- Permite leer los datos (nombre, correo, password)

// --- 2. RUTAS DE LA APLICACIÓN ---
app.use('/api/animales', rutasAnimales);
app.use('/api/auth', rutasAuth); // <-- Nuestra nueva ruta de login/registro

// --- 3. RUTA DE PRUEBA ---
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.json({ 
        mensaje: "API de Bovisoft activa y segura", 
        estado: "Funcionando perfectamente" 
    });
});

// --- 4. ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`Presiona Ctrl+C para detenerlo`);
});