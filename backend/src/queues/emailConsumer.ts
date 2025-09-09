import { getChannel } from "./rabbitmq";
import { sendEmail } from "../services/emailService";

export const startEmailConsumer = async () => {
  const channel = getChannel();
  if (!channel) {
    throw new Error("Canal do RabbitMQ não iniciado!")
  }

  console.log('Iniciando consumidor de emails...');

  channel.consume('emailQueue', async (msg) => {
    if (msg !== null) {
      try {
        const emailData = JSON.parse(msg.content.toString());
        console.log('Processando email:', emailData);

        await sendEmail(emailData);

        channel.ack(msg);
        console.log('Email processado com sucesso');
      } catch (error) {
        console.error('Erro ao processar email da fila:', error);

        const retryCount = msg.properties.headers?.['x-retry-count'] || 0;
        const maxRetries = 3;

        if (retryCount < maxRetries) {
          console.log(`Tentativa ${retryCount + 1}/${maxRetries} falhou. Agendando retry...`);

          let retryQueue;
          let delay;

          switch (retryCount) {
            case 0:
              retryQueue = 'emailRetry5s';
              delay = '5 segundos';
              break;
            case 1:
              retryQueue = 'emailRetry30s';
              delay = '30 segundos';
              break;
            case 2:
              retryQueue = 'emailRetry1m';
              delay = '1 minuto';
              break;
            default:
              retryQueue = 'emailFailed';
          }

          console.log(`Próximo retry em ${delay}`);

          channel.sendToQueue(retryQueue, msg.content, {
            persistent: true,
            headers: {
              ...msg.properties.headers,
              'x-retry-count': retryCount + 1,
              'x-retry-queue': retryQueue,
              'x-original-queue': 'emailQueue'
            }
          });

          channel.ack(msg);
        } else {
          console.error(`Máximo de ${maxRetries} tentativas atingido.`);

          const emailData = JSON.parse(msg.content.toString());
          console.error('Email falhou após todas as tentativas:', {
            id: emailData.emailId,
            to: emailData.to,
            subject: emailData.subject
          });

          channel.sendToQueue('emailFailed', msg.content, {
            persistent: true,
            headers: {
              ...msg.properties.headers,
              'x-failed-reason': error instanceof Error ? error.message : 'Erro desconhecido',
              'x-failed-at': new Date().toISOString()
            }
          });

          channel.ack(msg);
        }
      }
    }
  });
};

export const startFailedEmailConsumer = async () => {
  const channel = getChannel();
  if (!channel) {
    throw new Error("Canal do RabbitMQ não iniciado!")
  }

  console.log('Iniciando consumidor para emails falhos...');

  channel.consume('emailFailed', async (msg) => {
    if (msg !== null) {
      const emailData = JSON.parse(msg.content.toString());
      const retryCount = msg.properties.headers?.['x-retry-count'] || 0;
      const failedReason = msg.properties.headers?.['x-failed-reason'] || 'Erro desconhecido';

      console.error('Email falhou permanentemente:', {
        to: emailData.to,
        subject: emailData.subject,
        tentativas: retryCount,
        motivo: failedReason,
        data: msg.properties.headers?.['x-failed-at']
      });

      channel.ack(msg);
    }
  });
};