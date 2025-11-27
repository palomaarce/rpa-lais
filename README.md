# RPA LAIS

Automação RPA (Robotic Process Automation) para coleta de atendimentos e mensagens do sistema LAIS.

## 🚀 Funcionalidades

- ✅ Login automático no sistema LAIS
- ✅ Coleta de todos os atendimentos com paginação automática
- ✅ Coleta de mensagens de cada atendimento
- ✅ API REST para execução via HTTP
- ✅ Suporte a Docker
- ✅ Detecção automática de QR Code

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- (Opcional) Docker para execução em container

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/rpa-lais.git
cd rpa-lais

# Instale as dependências
npm install
```

## 💻 Uso

### Modo API (Recomendado)

Inicie o servidor:

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

**Endpoints disponíveis:**

- `GET/POST /rpa-lais` - Executa o RPA completo
- `GET /health` - Verifica status do serviço

**Exemplo de uso:**

```bash
# Executar RPA via API
curl -X POST http://localhost:3000/rpa-lais

# Health check
curl http://localhost:3000/health
```

### Modo CLI (Script)

Execute diretamente:

```bash
npm run rpa
```

Os arquivos JSON serão salvos localmente:
- `atendimentos.json` - Lista de todos os atendimentos
- `mensagens.json` - Mensagens de cada atendimento

## 🐳 Docker

### Construir imagem

```bash
docker build -t rpa-lais .
```

### Executar container

```bash
docker run -p 3000:3000 rpa-lais
```

### Com volume para salvar arquivos

```bash
docker run -p 3000:3000 -v $(pwd)/output:/app/output rpa-lais
```

## 📁 Estrutura do Projeto

```
rpa-lais/
├── rpa.js              # Lógica principal do RPA
├── server.js           # Servidor Express (API)
├── package.json        # Dependências e scripts
├── Dockerfile          # Configuração Docker
├── .gitignore         # Arquivos ignorados pelo Git
├── README.md          # Este arquivo
├── README-API.md      # Documentação da API
├── README-DOCKER.md   # Documentação Docker
└── INSTALACAO-DOCKER.md # Guia de instalação Docker
```

## 🔧 Configuração

### Variáveis de Ambiente

- `PORT` - Porta do servidor (padrão: 3000)
- `DOCKER` - Define modo Docker (usa headless)
- `CI` - Define ambiente CI/CD

### Credenciais

As credenciais estão hardcoded no código. Para produção, considere usar variáveis de ambiente ou um arquivo de configuração.

## 📊 Dados Coletados

### Atendimentos

Cada atendimento contém:
- `id` - ID único do atendimento
- `suspended` - Status de suspensão
- `lead` - Informações do lead (nome, telefone)
- `lastActivity` - Última atividade

### Mensagens

Cada mensagem contém:
- `day` - Data da mensagem
- `id` - ID único da mensagem
- `role` - Papel (user/assistant)
- `content` - Conteúdo da mensagem
- `status` - Status da mensagem
- `leadOrigin` - Origem do lead (ex: WhatsApp)

## 🚨 Troubleshooting

### Erro de autenticação

- Verifique se as credenciais estão corretas
- O token pode ter expirado, execute novamente

### QR Code detectado

Se aparecer um QR Code, o script exibirá uma mensagem. Após escanear e conectar, recarregue a página.

### Erro no Docker

- Certifique-se de que o Docker está rodando
- Verifique se todas as dependências foram instaladas

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor API
- `npm run rpa` - Executa o RPA como script CLI

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👤 Autor

Desenvolvido para automação de processos LAIS.

## 🙏 Agradecimentos

- Puppeteer para automação de navegador
- Express para API REST

