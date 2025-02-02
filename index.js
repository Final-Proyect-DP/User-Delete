require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const connectDB = require('./config/dbConfig'); // Importar la configuración de la base de datos
const authLoginConsumer = require('./consumers/authLoginConsumer'); // Importar el consumidor
const userLogoutConsumer = require('./consumers/userLogoutConsumer'); // Importar el consumidor
const userCreatedConsumer = require('./consumers/userCreatedConsumer'); // Importar el consumidor

const app = express();
const port = process.env.PORT || 3003;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE,
      version: process.env.API_VERSION,
      description: process.env.API_DESCRIPTION
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const corsOptions = {
  origin: '*',  // Permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors(corsOptions)); // Agregar esta línea
app.use(express.json());
app.use('/users', userRoutes);

connectDB().then(() => {
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Servidor corriendo en http://0.0.0.0:${port}`);
  });

  authLoginConsumer.run().catch(err => {
    logger.error('Error al iniciar authLoginConsumer:', err);
  });

  userLogoutConsumer.run().catch(err => {
    logger.error('Error al iniciar userLogoutConsumer:', err);
  });

  userCreatedConsumer.run().catch(err => {
    logger.error('Error al iniciar userCreatedConsumer:', err);
  });

}).catch(err => {
  logger.error('Error al conectar a MongoDB', err);
});
