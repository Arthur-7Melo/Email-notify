import { useState, useEffect } from 'react'

function App() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
    webhookUrl: ''
  })
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailId, setEmailId] = useState(null)

  useEffect(() => {
    if (!emailId || status !== 'pending') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3333/emails/${emailId}`)
        if (response.ok) {
          const emailData = await response.json()
          if (emailData.status !== 'PENDING') {
            setStatus(emailData.status.toLowerCase())
            clearInterval(interval)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [emailId, status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)
    setEmailId(null)

    try {
      const response = await fetch('http://localhost:3333/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus('pending')
        setEmailId(data.emailId)
        setFormData({
          to: '',
          subject: '',
          content: '',
          webhookUrl: ''
        })
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const reloadPage = () => {
    window.location.reload()
  }

  const getStatusEmoji = () => {
    switch (status) {
      case 'pending': return '⏳'
      case 'sent': return '✅'
      case 'failed': return '❌'
      case 'error': return '❌'
      default: return ''
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'pending': return 'E-mail enfileirado para envio!'
      case 'sent': return 'E-mail enviado com sucesso!'
      case 'failed': return 'Falha ao enviar o e-mail.'
      case 'error': return 'Erro ao processar a requisição. Tente novamente.'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2 transition-transform duration-200 hover:scale-110 cursor-pointer"
              onClick={reloadPage}
              title="Recarregar página"
            >
              📧 Email Service
            </h1>
            <p className="text-gray-600">Envie e-mails de forma assíncrona</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                Para
              </label>
              <input
                type="email"
                name="to"
                id="to"
                required
                value={formData.to}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                placeholder="destinatario@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                placeholder="Assunto do e-mail"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo
              </label>
              <textarea
                name="content"
                id="content"
                required
                rows={4}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                placeholder="Digite o conteúdo do e-mail..."
              />
            </div>

            <div>
              <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL (opcional)
              </label>
              <input
                type="url"
                name="webhookUrl"
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                placeholder="https://webhook.site/..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? '⏳ Enviando...' : '📤 Enviar E-mail'}
            </button>
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-lg text-center transition-all duration-300 ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              status === 'sent' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
              <div className="text-2xl mb-2">{getStatusEmoji()}</div>
              <p className="font-medium">{getStatusMessage()}</p>
              {status === 'pending' && (
                <p className="text-sm mt-2">Atualizando status automaticamente...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App