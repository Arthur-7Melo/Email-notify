import express from 'express'
import dotenv from 'dotenv';

const app = express();
app.use(express.json());
dotenv.config();

app.get('/', (_req, res) => {
  res.send({ message: 'API rodando!' });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`⚡ Server rodando em: ${PORT}`);
});