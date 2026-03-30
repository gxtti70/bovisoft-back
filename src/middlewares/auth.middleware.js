const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bovisoft_llave_super_secreta_2026';

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No tienes un pase válido.' });
    }

    try {
        const tokenLimpio = token.replace('Bearer ', '');
        const verificado = jwt.verify(tokenLimpio, JWT_SECRET);
        req.usuario = verificado; 
        next(); 
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido o ya expiró.' });
    }
};

module.exports = verificarToken;