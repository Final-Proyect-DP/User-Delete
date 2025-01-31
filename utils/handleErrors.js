const logger = require('../config/logger'); // Actualizar la ruta

const handleErrors = (error, id = '') => {
  logger.error(`Error en la operación ${id ? `para ID ${id}` : ''}:`, error);

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    return {
      status: 401,
      response: {
        success: false,
        message: 'Token inválido'
      }
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      status: 401,
      response: {
        success: false,
        message: 'Token expirado'
      }
    };
  }

  // Error de sesión
  if (error.message === 'Sesión inválida o expirada') {
    return {
      status: 401,
      response: {
        success: false,
        message: error.message
      }
    };
  }

  // Error de Redis
  if (error.message.includes('Redis')) {
    return {
      status: 500,
      response: {
        success: false,
        message: 'Error en el servicio de sesión'
      }
    };
  }

  // Error por defecto (500 Internal Server Error)
  return {
    status: 500,
    response: {
      success: false,
      message: 'Error interno del servidor'
    }
  };
};

module.exports = handleErrors;
