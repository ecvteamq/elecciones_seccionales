const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    // console.log("request:",req);
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado' });
    }
    try {
        const verificar = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificar;
        next()
    } catch (error) {
        res.status(400).json({ error: 'token no es valido' });
    }
}

module.exports = verifyToken;