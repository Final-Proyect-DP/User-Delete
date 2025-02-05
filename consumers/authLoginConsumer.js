const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'logouts-service-delete-group' });

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
          logger.info('Decrypted message:', decryptedMessage);

          const { userId, token } = decryptedMessage;
          if (!userId || !token) {
            throw new Error('Message does not contain userId or token');
          }

          await redisUtils.setToken(userId, token);
          logger.info(`Token stored in Redis for user ${userId}`);

        } catch (error) {
          logger.error('Error processing message:', {
            error: error.message,
            stack: error.stack
          });
        }
      },
    });
  } catch (error) {
    logger.error('Login Consumer: Error starting consumer:', error);
    throw error;
  }
};

module.exports = { run };