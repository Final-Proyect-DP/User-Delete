const kafka = require('../config/kafkaConfig');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'created-service-delete-group' });
let isRunning = false;

const run = async () => {
  if (isRunning) {
    logger.warn('Consumer is already running');
    return;
  }

  try {
    await consumer.connect();
    logger.info('🚀 Kafka consumer connected successfully');
    
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC_USER_CREATE, 
      fromBeginning: true 
    });
    logger.info(`📨 Subscribed to topic: ${process.env.KAFKA_TOPIC_USER_CREATE}`);

    isRunning = true;
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          logger.info('Message decrypted successfully');

          const userData = JSON.parse(decryptedMessage);
          const userId = new mongoose.Types.ObjectId(userData._id);
          const user = new User({ _id: userId });
          await user.save();
          logger.info(`✅ User inserted successfully: ${userId}`);
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      },
    });
  } catch (error) {
    logger.error('Consumer error:', error);
    isRunning = false;
    await disconnect();
    throw error;
  }
};

const disconnect = async () => {
  try {
    await consumer.disconnect();
    isRunning = false;
    logger.info('Consumer disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting consumer:', error);
  }
};

process.on('SIGTERM', disconnect);
process.on('SIGINT', disconnect);

module.exports = { run, disconnect };
