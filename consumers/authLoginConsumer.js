const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'logout-service-delete-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Create Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGIN, fromBeginning: true });
    logger.info(`Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGIN}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          logger.info('Mensaje descifrado:', decryptedMessage);

          const { userId, token } = decryptedMessage;
          if (!userId || !token) {
            throw new Error('Mensaje no contiene userId o token');
          }

          // Usar redisUtils.setToken en lugar de storeUserSession
          await redisUtils.setToken(userId, token);
          logger.info(`Token almacenado en Redis para usuario ${userId}`);

        } catch (error) {
          logger.error('Error procesando mensaje:', {
            error: error.message,
            stack: error.stack
          });
        }
      },
    });
  } catch (error) {
    logger.error('login Consumer: Error iniciando el consumidor:', error);
    throw error;
  }
};

module.exports = { run };