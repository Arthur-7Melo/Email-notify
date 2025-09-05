import { Request, Response } from 'express';
import { getChannel } from '../queues/rabbitmq';

export const receiveEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, content, webhookUrl } = req.body;
    if (!to || !subject || !content) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    const channel = getChannel();
    const emailData = { to, subject, content, webhookUrl };

    channel?.sendToQueue(
      'emailQueue',
      Buffer.from(JSON.stringify(emailData)),
      { persistent: true }
    );

    res.status(202).json({
      message: 'Email recebido e enviado para processamento',
      queued: true
    });
  } catch (error) {
    console.error('Erro ao receber email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}