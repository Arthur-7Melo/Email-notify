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
}) => {
  const { to, subject, content, webhookUrl } = emailData;

  let emailRecord;

  try {
    emailRecord = await prisma.email.create({
      data: {
        to,
        subject,
        content,
        webhookUrl,
        status: 'PENDING'
      }
    });

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

    if (emailRecord) {
      await prisma.email.update({
        where: { id: emailRecord.id },
        data: { status: 'FAILED' }
      });

      if (webhookUrl) {
        await notifyWebhook(webhookUrl, {
          emailId: emailRecord.id,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    throw error;
  }
};