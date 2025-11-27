# Instalação do Docker no macOS

O Docker não está instalado no seu sistema. Siga as instruções abaixo para instalar.

## Opção 1: Docker Desktop (Recomendado - Mais Fácil)

### Passo 1: Baixar o Docker Desktop

1. Acesse: https://www.docker.com/products/docker-desktop/
2. Clique em "Download for Mac"
3. Escolha a versão apropriada:
   - **Apple Silicon (M1/M2/M3)**: Docker Desktop for Mac with Apple Silicon
   - **Intel**: Docker Desktop for Mac with Intel chip

### Passo 2: Instalar

1. Abra o arquivo `.dmg` baixado
2. Arraste o Docker para a pasta Applications
3. Abra o Docker Desktop da pasta Applications
4. Aceite os termos de serviço
5. Aguarde a instalação completar (pode levar alguns minutos)

### Passo 3: Verificar Instalação

Abra o Terminal e execute:

```bash
docker --version
docker-compose --version
```

Se aparecer as versões, a instalação foi bem-sucedida!

## Opção 2: Via Homebrew (Linha de Comando)

Se você tem o Homebrew instalado:

```bash
# Instalar Docker Desktop via Homebrew
brew install --cask docker

# Iniciar o Docker Desktop
open /Applications/Docker.app
```

Aguarde o Docker iniciar (ícone da baleia na barra de menu).

## Verificar se está funcionando

Após a instalação, teste com:

```bash
docker run hello-world
```

Se aparecer uma mensagem de sucesso, o Docker está funcionando corretamente!

## Próximos Passos

Após instalar o Docker:

1. **Faça login no Docker Hub:**
   ```bash
   docker login
   ```
   (Use suas credenciais do Docker Hub)

2. **Construa e publique a imagem:**
   ```bash
   ./docker-build.sh -u SEU_USERNAME -t latest
   ```

## Solução de Problemas

### Docker não inicia
- Certifique-se de que o Docker Desktop está aberto
- Verifique se há atualizações pendentes do macOS
- Reinicie o Docker Desktop

### Erro de permissão
- O Docker Desktop precisa de permissões administrativas
- Na primeira execução, pode pedir sua senha do macOS

### Verificar se está rodando
```bash
docker ps
```
Se não der erro, o Docker está funcionando!

