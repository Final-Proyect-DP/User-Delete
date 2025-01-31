const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const EXPIRATION_TIME = 3600; // 1 hora en segundos

const redisUtils = {
  async setToken(userId, token) {
    try {
      const userIdStr = String(userId);
      const tokenStr = String(token);

      await new Promise((resolve, reject) => {
        redisClient.set(userIdStr, tokenStr, 'EX', EXPIRATION_TIME, (err, reply) => {
          if (err) reject(err);
          resolve(reply);
        });
      });
      
      logger.info(`Token establecido para usuario ${userIdStr} con expiración de ${EXPIRATION_TIME} segundos`);
    } catch (error) {
      logger.error('Error al establecer token en Redis:', error);
      throw error;
    }
  },

  async getToken(userId) {
    try {
      const token = await new Promise((resolve, reject) => {
        redisClient.get(userId, (err, reply) => {
          if (err) reject(err);
          resolve(reply);
        });
      });
      return token;
    } catch (error) {
      logger.error('Error al obtener token de Redis:', error);
      throw error;
    }
  },

  async deleteToken(userId) {
    try {
      const result = await redisClient.del(userId);
      const message = result ? 'Sesión cerrada exitosamente' : 'Sesión no encontrada';
      logger.info(`${message} para usuario ${userId}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error al eliminar token de Redis:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
