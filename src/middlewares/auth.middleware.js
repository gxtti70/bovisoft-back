const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bovisoft_llave_super_secreta_2026';

const verificarToken = (req, res, next) => {
    // Buscamos el token en la cabecera de la petición
    const token = req.header('Authorization');

    // Si no hay token, lo rebotamos
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No tienes un pase válido.' });
    }

    try {
        // Le quitamos la palabra "Bearer " que suele venir pegada al token
        const tokenLimpio = token.replace('Bearer ', '');
        
        // Verificamos que el token sea nuestro y no esté vencido
        const verificado = jwt.verify(tokenLimpio, JWT_SECRET);
        
        // Guardamos los datos del usuario en la petición y lo dejamos pasar
        req.usuario = verificado; 
        next(); 
        
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido o ya expiró.' });
    }
};

module.exports = verificarToken;