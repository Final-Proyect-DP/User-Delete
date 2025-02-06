const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Delete-Logout-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGOUT, fromBeginning: true });
    logger.info(`📨 Logout Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGOUT}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          
          if (!decryptedMessage || !decryptedMessage.userId) {
            throw new Error('Invalid decrypted message or userId not found');
          }
          
          await redisUtils.deleteToken(decryptedMessage.userId);
          logger.info(`🗑️ Logout Consumer: Token deleted for user ${decryptedMessage.userId}`);
        } catch (error) {
          logger.error('❌ Logout Consumer: Failed:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('❌ Logout Consumer: Failed to start:', error);
    throw error;
  }
};

module.exports = { run };