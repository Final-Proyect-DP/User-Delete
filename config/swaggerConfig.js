const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Users API",
      version: "1.0.0",
      description: "API to create users",
    },
    servers: [
      {
        url: `http://${process.env.HOST}:${process.env.PORT}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;