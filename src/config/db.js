const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  // Si no tienes un archivo .env configurado, usará los valores de la derecha
  user: process.env.DB_USER || 'gxtti_admin', 
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ganaderia_db',
  password: process.env.DB_PASSWORD || 'ganadero_pro',
  port: 5432,
});

pool.on('connect', () => {
  console.log('🐘 DB Conectada: El ganado está a salvo.');
});

module.exports = pool;