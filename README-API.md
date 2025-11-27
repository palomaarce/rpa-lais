# API RPA LAIS

API REST para execução do RPA que coleta atendimentos e mensagens do sistema LAIS.

## Instalação

```bash
npm install
```

## Execução

### Modo API (Servidor)
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

### Modo Script (CLI)
```bash
npm run rpa
```

## Endpoints

### `GET /health`
Verifica o status do serviço.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "service": "rpa-lais"
}
```

### `POST /rpa-lais` ou `GET /rpa-lais`
Executa o processo RPA completo (coleta atendimentos e mensagens).

**Resposta de Sucesso:**
```json
{
  "success": true,
  "executionTime": "45000ms",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "data": {
    "atendimentos": {
      "total": 70,
      "pagination": {
        "total": 70,
        "totalPages": 5,
        "limit": 15
      }
    },
    "mensagens": {
      "totalChats": 70,
      "totalMessages": 1757
    }
  },
  "atendimentos": {
    "data": {
      "chats": [...],
      "pagination": {...}
    },
    "message": "OK"
  },
  "mensagens": {
    "data": {
      "chatId1": [...],
      "chatId2": [...]
    },
    "totalChats": 70,
    "totalMessages": 1757
  }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "executionTime": "5000ms",
  "timestamp": "2025-01-27T10:00:00.000Z"
}
```

## Exemplos de Uso

### cURL
```bash
# Health check
curl http://localhost:3000/health

# Executar RPA
curl -X POST http://localhost:3000/rpa-lais

# Ou via GET
curl http://localhost:3000/rpa-lais
```

### JavaScript (fetch)
```javascript
// Executar RPA
const response = await fetch('http://localhost:3000/rpa-lais', {
  method: 'POST'
});

const data = await response.json();
console.log(data);
```

### Python (requests)
```python
import requests

# Executar RPA
response = requests.post('http://localhost:3000/rpa-lais')
data = response.json()
print(data)
```

## Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)
- `DOCKER`: Define se está rodando no Docker (usa modo headless)
- `CI`: Define se está em ambiente CI/CD

## Docker

### Construir imagem
```bash
docker build -t rpa-lais .
```

### Executar container
```bash
docker run -p 3000:3000 rpa-lais
```

### Acessar API
```bash
curl http://localhost:3000/rpa-lais
```

## Notas

- O processo RPA pode levar vários minutos para completar
- A API retorna todos os dados coletados no corpo da resposta
- Os arquivos JSON também são salvos localmente (quando executado como script)
- O servidor mantém logs detalhados de todas as operações

