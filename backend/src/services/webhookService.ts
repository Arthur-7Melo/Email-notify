import axios from 'axios';

export const notifyWebhook = async (url: string, data: any) => {
  try {
    if (!url || url === 'https://webhook.site/your-unique-url') {
      console.log('URL de webhook não configurada ou é um exemplo');
      return;
    }

    const response = await axios.post(url, data, {
      timeout: 5000,
      validateStatus: (status) => status < 500
    });

    console.log('Webhook notificado com sucesso:', response.status);
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout ao notificar webhook:', url);
    } else if (error.response) {
      console.error('Erro ao notificar webhook:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do webhook:', url);
    } else {
      console.error('Erro ao configurar requisição do webhook:', error.message);
    }
  }
};