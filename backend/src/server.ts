import express from 'express'
import cors from 'cors'
import { connectRabbitMQ } from './queues/rabbitmq';
import { startEmailConsumer } from './queues/emailConsumer';
import { receiveEmail } from './controllers/emailController';
import { PORT } from './config';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
app.use(express.json());
app.use(cors())

app.post('/email', receiveEmail);
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Email service is running' });
});

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
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();