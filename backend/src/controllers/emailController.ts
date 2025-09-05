import { Request, Response } from 'express';
import { getChannel } from '../queues/rabbitmq';
import prisma from '../utils/db';

export const receiveEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, content, webhookUrl } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const emailRecord = await prisma.email.create({
      data: {
        to,
        subject,
        content,
        webhookUrl,
        status: 'PENDING'
      }
    });

    const channel = getChannel();
    const emailData = {
      to,
      subject,
      content,
      webhookUrl,
      emailId: emailRecord.id
    };

    channel?.sendToQueue(
      'emailQueue',
      Buffer.from(JSON.stringify(emailData)),
      { persistent: true }
    );

    res.status(202).json({
      message: 'Email recebido e enviado para processamento',
      emailId: emailRecord.id,
      queued: true
    });
  } catch (error) {
    console.error('Erro ao receber email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getEmailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const email = await prisma.email.findUnique({
      where: { id: Number(id) }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }

    res.json(email);
  } catch (error) {
    console.error('Erro ao buscar email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
