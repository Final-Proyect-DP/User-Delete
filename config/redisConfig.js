require('dotenv').config();
const redis = require('redis');
//const logger = require('./logger');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  logger.error('Error al conectar a Redis', err);
});

module.exports = redisClient;
