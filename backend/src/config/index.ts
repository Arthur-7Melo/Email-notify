import { config } from "dotenv";

config();

export const PORT = process.env.PORT || 3333;
export const DATABASE_URL = process.env.DATABASE_URL;
export const RABBITMQ_URL = process.env.RABBITMQ_URL;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

if (!DATABASE_URL) {
  throw new Error("URL Database não informado!")
}

if (!RABBITMQ_URL) {
  throw new Error("URL RabbitMQ não informado!")
}
