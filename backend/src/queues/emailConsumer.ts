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
      } catch (error) {
        console.error('Erro ao processar email da fila:', error);
        channel.nack(msg, false, false);
      }
    }
  });
};
