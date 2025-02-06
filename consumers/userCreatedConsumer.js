const kafka = require('../config/kafkaConfig');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Delete-Create-Consumer' });
let isRunning = false;

const run = async () => {
  if (isRunning) {
    return;
  }

  try {
    await consumer.connect();
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC_USER_CREATE, 
      fromBeginning: true 
    });
    logger.info(`📨 Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_USER_CREATE}`);

    isRunning = true;
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          
          const userData = JSON.parse(decryptedMessage);
          const userId = new mongoose.Types.ObjectId(userData._id);
          const user = new User({ _id: userId });
          await user.save();
          logger.info(`✅ Create Consumer: User ${userId} created successfully`);
        } catch (error) {
          logger.error('❌ Create Consumer: Failed to process message:', error);
        }
      },
    });
  } catch (error) {
    logger.error('❌ Create Consumer: Failed to start:', error);
    isRunning = false;
    await disconnect();
    throw error;
  }
};

const disconnect = async () => {
  try {
    await consumer.disconnect();
    isRunning = false;
  } catch (error) {
    logger.error('❌ Create Consumer: Failed to disconnect:', error);
  }
};


module.exports = { run, disconnect };
