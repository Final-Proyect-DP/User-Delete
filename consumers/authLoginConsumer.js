const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Delete-Login-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGIN, fromBeginning: true });
    logger.info(`📨 Login Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGIN}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);

          const { userId, token } = decryptedMessage;
          if (!userId || !token) {
            throw new Error('Message does not contain userId or token');
          }

          await redisUtils.setToken(userId, token);
          logger.info(`💾 Login Consumer: Token stored for user ${userId}`);
        } catch (error) {
          logger.error('❌ Login Consumer: Failed:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('❌ Login Consumer: Failed to start:', error);
    throw error;
  }
};

module.exports = { run };