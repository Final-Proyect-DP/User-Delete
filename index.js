
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
s
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const connectDB = require('./config/dbConfig');
const swaggerDocs = require('./config/swaggerConfig');

const authLoginConsumer = require('./consumers/authLoginConsumer');
const userLogoutConsumer = require('./consumers/userLogoutConsumer');
const { run: runUserCreatedConsumer } = require('./consumers/userCreatedConsumer');

const app = express();
const port = process.env.PORT || 3003;
const host = process.env.HOST || 'localhost'; 

const corsOptions = {
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};


app.use(cors(corsOptions));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/users', userRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-delete' });
});

const startConsumers = async () => {
  try {
    logger.info('Iniciando consumidores...');
    await Promise.all([
      authLoginConsumer.run(),
      userLogoutConsumer.run(),
      runUserCreatedConsumer()
    ]);
    logger.info('Todos los consumidores iniciados correctamente');
  } catch (err) {
    logger.error('Error starting consumers:', err);
    process.exit(1);
  }
};

// Inicialización del servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, host, () => {
      logger.info(`Server running at http://${host}:${port}`);
    });
    await startConsumers();
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
