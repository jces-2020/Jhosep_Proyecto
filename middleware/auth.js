const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // Obtener el token de la cabecera 'Authorization'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    // Verificar el token con la clave secreta desde variable de entorno
    const secret = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Guardar los datos del usuario decodificados en la solicitud
    next(); // Continuar con la siguiente función/middleware
  } catch (err) {
    res.status(403).json({ error: 'Token no válido o expirado.' });
  }
}

module.exports = verifyToken;