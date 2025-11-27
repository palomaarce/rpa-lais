const express = require('express');
const rpaLogin = require('./rpa');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'rpa-lais'
  });
});

// Endpoint principal do RPA
app.post('/rpa-lais', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('=== Iniciando execução do RPA via API ===');
    
    // Executa o RPA
    const result = await rpaLogin();
    
    const executionTime = Date.now() - startTime;
    
    // Retorna os resultados
    res.json({
      success: true,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
      data: {
        atendimentos: {
          total: result.atendimentos.data.chats.length,
          pagination: result.atendimentos.data.pagination
        },
        mensagens: {
          totalChats: result.mensagens.totalChats,
          totalMessages: result.mensagens.totalMessages
        }
      },
      atendimentos: result.atendimentos,
      mensagens: result.mensagens
    });
    
    console.log(`=== RPA executado com sucesso em ${executionTime}ms ===`);
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('Erro ao executar RPA:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint GET também (para facilitar testes)
app.get('/rpa-lais', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('=== Iniciando execução do RPA via API (GET) ===');
    
    // Executa o RPA
    const result = await rpaLogin();
    
    const executionTime = Date.now() - startTime;
    
    // Retorna os resultados
    res.json({
      success: true,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
      data: {
        atendimentos: {
          total: result.atendimentos.data.chats.length,
          pagination: result.atendimentos.data.pagination
        },
        mensagens: {
          totalChats: result.mensagens.totalChats,
          totalMessages: result.mensagens.totalMessages
        }
      },
      atendimentos: result.atendimentos,
      mensagens: result.mensagens
    });
    
    console.log(`=== RPA executado com sucesso em ${executionTime}ms ===`);
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('Erro ao executar RPA:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor RPA LAIS iniciado na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Endpoint RPA: http://localhost:${PORT}/rpa-lais`);
  console.log(`\nAguardando requisições...\n`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

