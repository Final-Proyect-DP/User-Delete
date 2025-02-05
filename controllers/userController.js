const User = require('../models/User');
const userService = require('../services/userService');
const producer = require('../producers/kafkaProducer');
const mongoose = require('mongoose');
const redisClient = require('../config/redisConfig');
require('dotenv').config();

// Handles DELETE requests to remove a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const objectId = new mongoose.Types.ObjectId(id);

    const userExists = await User.exists({ _id: objectId });
    if (!userExists) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    const topic = process.env.KAFKA_TOPIC;
    if (!topic) {
      throw new Error('KAFKA_TOPIC is not defined in .env file');
    }

    const message = JSON.stringify({ id });
    const encryptedMessage = userService.encrypt(message);
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(encryptedMessage) }],
    });

    await User.findByIdAndDelete(objectId);

    redisClient.del(id, (redisErr) => {
      if (redisErr) {
        console.error('Error deleting token from Redis:', redisErr);
        return res.status(500).json({ error: 'User deleted but there was an error clearing the Redis token' });
      }
      res.json({ message: 'User and token successfully deleted' });
    });

  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal error deleting user' });
  }
};

module.exports = {
  deleteUser
};
