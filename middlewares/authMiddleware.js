const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisConfig');

const verifyToken = (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifying JWT:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    redisClient.get(id, (err, reply) => {
      if (err) {
        console.error('Error getting token from Redis:', err);
        return res.status(500).json({ error: 'Error verifying token in Redis' });
      }

      if (reply !== token) {
        return res.status(401).json({ error: 'Invalid token for this user' });
      }

      next();
    });
  });
};

module.exports = {
  verifyToken
};
