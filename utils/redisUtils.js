const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const EXPIRATION_TIME = 3600; // 1 hour in seconds

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
      
      logger.info(`Token set for user ${userIdStr} with expiration of ${EXPIRATION_TIME} seconds`);
    } catch (error) {
      logger.error('Error setting token in Redis:', error);
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
      logger.error('Error getting token from Redis:', error);
      throw error;
    }
  },

  async deleteToken(userId) {
    try {
      const result = await redisClient.del(userId);
      const message = result ? 'Session closed successfully' : 'Session not found';
      logger.info(`${message} for user ${userId}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error deleting token from Redis:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
