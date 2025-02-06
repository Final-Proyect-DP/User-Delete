const logger = require('../config/logger'); // Actualizar la ruta

const handleErrors = (error, id = '') => {
  logger.error(`Error in operation ${id ? `for ID ${id}` : ''}:`, error);

  // JWT Errors
  if (error.name === 'JsonWebTokenError') {
    return {
      status: 401,
      response: {
        success: false,
        message: 'Invalid token'
      }
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      status: 401,
      response: {
        success: false,
        message: 'Token expired'
      }
    };
  }

  // Session Error
  if (error.message === 'Invalid or expired session') {
    return {
      status: 401,
      response: {
        success: false,
        message: error.message
      }
    };
  }

  // Redis Error
  if (error.message.includes('Redis')) {
    return {
      status: 500,
      response: {
        success: false,
        message: 'Session service error'
      }
    };
  }

  // Default Error (500 Internal Server Error)
  return {
    status: 500,
    response: {
      success: false,
      message: 'Internal server error'
    }
  };
};

module.exports = handleErrors;
