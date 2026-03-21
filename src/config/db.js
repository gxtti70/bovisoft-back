const { Pool } = require('pg');
require('dotenv').config();

// Creamos el pool usando directamente la URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ¡ESTO ES VITAL! Sin esto, Neon rechazará la conexión por seguridad.
  }
});

module.exports = pool;