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
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGOUT, fromBeginning: true });
    logger.info(`Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGOUT}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          logger.info('Encrypted message received:', encryptedMessage);
          
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          
          if (!decryptedMessage || !decryptedMessage.userId) {
            throw new Error('Invalid decrypted message or userId not found');
          }
          
          logger.info(`Processing logout for user: ${decryptedMessage.userId}`);
          await redisUtils.deleteToken(decryptedMessage.userId);
          logger.info(`Token successfully deleted for user: ${decryptedMessage.userId}`);

        } catch (error) {
          logger.error('Error processing logout message:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('Login Consumer: Error starting the consumer:', error);
    throw error;
  }
};

module.exports = { run };