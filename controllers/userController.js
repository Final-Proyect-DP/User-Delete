const User = require('../models/User');
const userService = require('../services/userService');
const producer = require('../producers/kafkaProducer');
const mongoose = require('mongoose');
const redisClient = require('../config/redisConfig');
require('dotenv').config();

// Maneja las solicitudes DELETE para eliminar un usuario
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const objectId = new mongoose.Types.ObjectId(id);

    const userExists = await User.exists({ _id: objectId });
    if (!userExists) {
      return res.status(404).json({ error: `Usuario con ID ${id} no encontrado` });
    }

    const topic = process.env.KAFKA_TOPIC;
    if (!topic) {
      throw new Error('KAFKA_TOPIC no está definido en el archivo .env');
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
        console.error('Error al eliminar token de Redis:', redisErr);
        return res.status(500).json({ error: 'Usuario eliminado pero hubo un error al limpiar el token de Redis' });
      }
      res.json({ message: 'Usuario y token eliminados correctamente' });
    });

  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
};

module.exports = {
  deleteUser
};
