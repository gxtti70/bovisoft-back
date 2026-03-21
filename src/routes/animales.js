const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const verificarToken = require('../middlewares/auth.middleware');

// RUTA PARA REGISTRAR UN ANIMAL (POST)
router.post('/', verificarToken, async (req, res) => {
    try {
        const { arete_visual, nombre, raza, genero, peso_actual } = req.body;
        
        const nuevoAnimal = await pool.query(
            "INSERT INTO animales (arete_visual, nombre, raza, genero, peso_actual, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [arete_visual, nombre, raza, genero, peso_actual, req.usuario.id] 
        );

        res.status(201).json({
            ok: true,
            mensaje: "¡Vaca registrada con éxito!",
            animal: nuevoAnimal.rows[0]
        });
    } catch (error) {
        console.error("Error en POST:", error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// RUTA PARA LISTAR ANIMALES ACTIVOS (CON SCROLL INFINITO) ---
router.get('/', verificarToken, async (req, res) => {
    try {
        //Leemos qué página nos está pidiendo el frontend (si no manda nada, es la página 1)
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = 12; 
        const offset = (pagina - 1) * limite; 

        // Traemos solo los 12 animales de esta página específica
        const consulta = await pool.query(
            "SELECT * FROM animales WHERE usuario_id = $1 ORDER BY fecha_registro DESC LIMIT $2 OFFSET $3",
            [req.usuario.id, limite, offset]
        );
        
        
        const totalVacas = await pool.query(
            "SELECT COUNT(*) FROM animales WHERE usuario_id = $1",
            [req.usuario.id]
        );
        
        const totalRegistros = parseInt(totalVacas.rows[0].count);

        
        res.json({
            ok: true,
            total: totalRegistros,
            paginaActual: pagina,
            // Matemática simple: si los que me salté + los 12 actuales son menos que el total, hay más.
            hayMasResultados: (offset + limite) < totalRegistros, 
            animales: consulta.rows
        });
    } catch (error) {
        console.error("Error en GET animales paginados:", error.message);
        res.status(500).json({ ok: false, error: "Error al leer la base de datos" });
    }
});

// --- 3. RUTA PARA ELIMINAR/DAR DE BAJA (DELETE) ---
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Solo borramos si el ID coincide Y le pertenece al usuario
        const resultado = await pool.query(
            "DELETE FROM animales WHERE id = $1 AND usuario_id = $2 RETURNING *", 
            [id, req.usuario.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ ok: false, mensaje: "No tienes permiso o el animal no existe" });
        }

        res.json({
            ok: true,
            mensaje: "Animal eliminado correctamente",
            animalEliminado: resultado.rows[0]
        });
    } catch (error) {
        console.error("❌ Error en DELETE:", error.message);
        res.status(500).json({ ok: false, error: "Error al eliminar en la DB" });
    }
});

// --- 4. RUTA PARA ACTUALIZAR DATOS (PUT) ---
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, peso_actual, raza } = req.body;

        const resultado = await pool.query(
            "UPDATE animales SET nombre = $1, peso_actual = $2, raza = $3 WHERE id = $4 AND usuario_id = $5 RETURNING *",
            [nombre, peso_actual, raza, id, req.usuario.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ ok: false, mensaje: "No tienes permiso o el animal no existe" });
        }

        res.json({
            ok: true,
            mensaje: "Datos actualizados con éxito",
            animal: resultado.rows[0]
        });
    } catch (error) {
        console.error("❌ Error en PUT:", error.message);
        res.status(500).json({ ok: false, error: "Error al actualizar en la DB" });
    }
});

// --- 5. RUTA PARA REGISTRAR UNA VENTA (SOLUCIÓN APLICADA) ---
router.post('/vender', verificarToken, async (req, res) => {
    const { animal_id, precio_venta, cliente } = req.body;

    if (!animal_id || isNaN(precio_venta)) {
        return res.status(400).json({ ok: false, error: "Datos de venta inválidos (ID o Precio)" });
    }

    try {
        await pool.query('BEGIN');

        // Verificamos que el animal exista Y que le pertenezca a este usuario
        const animalRes = await pool.query(
            "SELECT nombre, arete_visual FROM animales WHERE id = $1 AND usuario_id = $2", 
            [animal_id, req.usuario.id]
        );

        if (animalRes.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ ok: false, error: "El animal no existe o no te pertenece" });
        }

        const { nombre, arete_visual } = animalRes.rows[0];

        // Guardamos la venta con el ID del dueño
        await pool.query(
            "INSERT INTO ventas (animal_id, nombre_animal, arete_visual, precio_venta, cliente, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [animal_id, nombre, arete_visual, precio_venta, cliente || 'Cliente General', req.usuario.id]
        );

        await pool.query("DELETE FROM animales WHERE id = $1 AND usuario_id = $2", [animal_id, req.usuario.id]);

        await pool.query('COMMIT');

        res.json({
            ok: true,
            mensaje: `Negocio cerrado: ${nombre} ha sido vendido.`
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("ERROR REAL EN DB:", error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// --- 6. RUTA PARA OBTENER EL HISTORIAL DE VENTAS (GET) ---
router.get('/ventas-historial', verificarToken, async (req, res) => {
    try {
        // Solo traemos las ventas de este usuario
        const consulta = await pool.query(
            "SELECT * FROM ventas WHERE usuario_id = $1 ORDER BY fecha_venta DESC",
            [req.usuario.id]
        );
        
        res.json({
            ok: true,
            total: consulta.rowCount,
            ventas: consulta.rows
        });
    } catch (error) {
        console.error("Error en GET historial:", error.message);
        res.status(500).json({ ok: false, error: "Error al leer el historial de ventas" });
    }
});

module.exports = router;