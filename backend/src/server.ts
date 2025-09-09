import express from 'express'
import cors from 'cors'
import { connectRabbitMQ } from './queues/rabbitmq';
import { startEmailConsumer, startFailedEmailConsumer } from './queues/emailConsumer';
import { PORT } from './config';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import emailRouter from './routes/index'

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(emailRouter);

const swaggerDocument = YAML.load('./openapi.yaml');
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

const startServer = async () => {
  try {
    await connectRabbitMQ();
    await startEmailConsumer();
    await startFailedEmailConsumer();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();