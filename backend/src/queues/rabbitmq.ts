import * as amqp from 'amqplib';
import { RABBITMQ_URL } from '../config';
import { NODE_ENV } from '../config';

type AmqpConnectionWithCreate = amqp.Connection & {
  createChannel(): Promise<amqp.Channel>;
};

let connection: AmqpConnectionWithCreate | undefined;
let channel: amqp.Channel | undefined;

export const connectRabbitMQ = async (): Promise<amqp.Channel> => {
  try {
    const queueSuffix = NODE_ENV === 'development' ? '_dev' : '';
    const rabbitmqURL = RABBITMQ_URL || 'amqp://localhost:5672';
    connection = (await amqp.connect(rabbitmqURL)) as unknown as AmqpConnectionWithCreate;
    channel = await connection.createChannel();

    await channel.assertQueue(`emailQueue${queueSuffix}`, {
      durable: true,
      deadLetterExchange: 'email_retry_exchange'
    });

    await channel.assertExchange('email_retry_exchange', 'direct', { durable: true });

    await channel.assertQueue('emailRetry5s', {
      durable: true,
      deadLetterExchange: 'email_retry_exchange',
      messageTtl: 5000
    });

    await channel.assertQueue('emailRetry30s', {
      durable: true,
      deadLetterExchange: 'email_retry_exchange',
      messageTtl: 30000
    });

    await channel.assertQueue('emailRetry1m', {
      durable: true,
      deadLetterExchange: 'email_retry_exchange',
      messageTtl: 60000
    });

    await channel.assertQueue('emailFailed', { durable: true });

    await channel.bindQueue('emailRetry5s', 'email_retry_exchange', 'email_retry');
    await channel.bindQueue('emailRetry30s', 'email_retry_exchange', 'email_retry');
    await channel.bindQueue('emailRetry1m', 'email_retry_exchange', 'email_retry');
    await channel.bindQueue('emailQueue', 'email_retry_exchange', 'email_retry');

    console.log('✅ Conectado ao RabbitMQ com sistema de retry configurado');
    return channel;
  } catch (error) {
    console.error('Erro ao conectar com RabbitMQ:', error);
    throw error;
  }
};

export const getChannel = () => channel;
export const getConnection = () => connection;
