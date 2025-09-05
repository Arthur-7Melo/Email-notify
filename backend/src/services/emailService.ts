import nodemailer from 'nodemailer';
import prisma from '../utils/db';
import { notifyWebhook } from './webhookService';
import { SMTP_USER, SMTP_PASSWORD } from '../config';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD
  }
});

export const sendEmail = async (emailData: {
  to: string;
  subject: string;
  content: string;
  webhookUrl?: string;
  emailId: number;
}) => {
  const { to, subject, content, webhookUrl, emailId } = emailData;

  try {
    let emailRecord = await prisma.email.findUnique({
      where: { id: emailId }
    });

    if (!emailRecord) {
      throw new Error(`Email com ID ${emailId} não encontrado`);
    }

    const info = await transporter.sendMail({
      from: '"Email Service" <noreply@example.com>',
      to,
      subject,
      text: content,
    });

    await prisma.email.update({
      where: { id: emailRecord.id },
      data: { status: 'SENT' }
    });

    if (webhookUrl) {
      await notifyWebhook(webhookUrl, {
        emailId: emailRecord.id,
        status: 'SENT',
        messageId: info.messageId
      });
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);

    await prisma.email.update({
      where: { id: emailId },
      data: { status: 'FAILED' }
    });

    if (webhookUrl) {
      await notifyWebhook(webhookUrl, {
        emailId: emailId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    throw error;
  }
};