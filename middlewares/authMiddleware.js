const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisConfig');

const verifyToken = (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error al verificar JWT:', err);
      return res.status(401).json({ error: 'Token no válido' });
    }

    redisClient.get(id, (err, reply) => {
      if (err) {
        console.error('Error al obtener token de Redis:', err);
        return res.status(500).json({ error: 'Error al verificar el token en Redis' });
      }

      if (reply !== token) {
        return res.status(401).json({ error: 'Token no válido para este usuario' });
      }

      next();
    });
  });
};

module.exports = {
  verifyToken
};
