# Serviço de Envio de E-mails Assíncrono
Este projeto é um serviço de envio de e-mails que utiliza uma arquitetura baseada em filas para processamento assíncrono. Ele recebe solicitações de e-mails via API REST, enfileira essas solicitações no RabbitMQ e as processa em background, salvando o status no PostgreSQL e notificando webhooks quando o envio é concluído.

## 🏗️ Arquitetura do Projeto
### Camadas da Aplicação
1. Camada de Apresentação (API REST)
  * Controller: Recebe as requisições HTTP, valida os dados e publica as mensagens na fila
  * Endpoint: /email (POST) para receber os e-mails

2. Camada de Serviço
  * Serviços de Domínio: Contêm a lógica de negócio para envio de e-mails e notificação de webhooks
  * emailService: Responsável por salvar no banco, enviar o e-mail e atualizar o status
  * webHookService: Responsável por notificar os webhooks sobre o status do e-mail

3. Camada de Infraestrutura
  * Conexões com Bancos de Dados e Filas:
  * db.ts: Configuração do Prisma Client para acesso ao PostgreSQL
  * rabbitmq.ts: Configuração da conexão com o RabbitMQ
  * Consumidor de Fila: emailConsumer.ts - Processa as mensagens da fila e chama o serviço de e-mail

4. Camada de Acesso a Dados
  * ORM Prisma: Define o schema do banco de dados e fornece operações CRUD para a entidade Email

## 📡 Endpoints Disponíveis
### POST /email
Recebe uma solicitação de envio de e-mail e a enfileira para processamento assíncrono.
#### Body:
```json
{
  "to": "destinatario@exemplo.com",
  "subject": "Assunto do E-mail",
  "content": "Conteúdo do e-mail",
  "webhookUrl": "https://exemplo.com/webhook"
}
```
#### Resposta:
* `202 Accepted:` E-mail aceito para processamento
* `400 Bad Request:` Dados incompletos ou inválidos

### GET /health
Endpoint de health check para verificar se o serviço está rodando.
#### Resposta:
```json
{
  "status": "OK",
  "message": "Email service is running"
}
```

## 🚀 Como Executar
### Pré-requisitos
* Node.js (versão 16 ou superior)
* PostgreSQL
* RabbitMQ
* npm ou yarn

### Passos
1. Clone o repositório:
```bash
git clone 
cd backend
```
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente no arquivo `.env:`
```text
DATABASE_URL="postgresql://usuario:senha@localhost:5432/emaildb"
RABBITMQ_URL="amqp://localhost:5672"
PORT="3333"
SMTP_USER="seu_usuario_ethereal"
SMTP_PASS="sua_senha_ethereal"
```
4. Execute as migrations do Prisma:
```bash
npx prisma generate
npx prisma db push
```
5. Inicie o servidor:
```bash
npm run dev
```

## 🛠️ Tecnologias Utilizadas
* Node.js + TypeScript: Runtime e linguagem
* Express: Framework web
* Prisma: ORM para PostgreSQL
* RabbitMQ: Message broker para filas
* Nodemailer: Cliente SMTP para envio de e-mails
* Axios: Cliente HTTP para webhooks

## 📝 Licença
Este projeto está sob a licença MIT.