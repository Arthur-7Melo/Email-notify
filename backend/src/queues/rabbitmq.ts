import * as amqp from 'amqplib';
import { RABBITMQ_URL } from '../config';

type AmqpConnectionWithCreate = amqp.Connection & {
  createChannel(): Promise<amqp.Channel>;
};

let connection: AmqpConnectionWithCreate | undefined;
let channel: amqp.Channel | undefined;

export const connectRabbitMQ = async (): Promise<amqp.Channel> => {
  try {
    const rabbitmqURL = RABBITMQ_URL || 'amqp://localhost:5672';
    connection = (await amqp.connect(rabbitmqURL)) as unknown as AmqpConnectionWithCreate;
    channel = await connection.createChannel();

    await channel.assertQueue('emailQueue', { durable: true });
    console.log('✅ Conectado ao RabbitMQ');
    return channel;
  } catch (error) {
    console.error('Erro ao conectar com RabbitMQ:', error);
    throw error;
  }
};

export const getChannel = () => channel;
export const getConnection = () => connection;
