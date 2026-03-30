const express = require('express');
const cors = require('cors');
const rutasAnimales = require('./routes/animales');
const rutasAuth = require('./routes/auth');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/animales', rutasAnimales);
app.use('/api/auth', rutasAuth);

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.json({ 
        mensaje: "API de Bovisoft activa y segura", 
        estado: "Funcionando perfectamente" 
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`Presiona Ctrl+C para detenerlo`);
});