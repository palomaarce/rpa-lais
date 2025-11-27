# Docker - RPA LAIS

Este documento explica como construir e publicar a imagem Docker do RPA LAIS no Docker Hub.

## Pré-requisitos

- Docker instalado (veja [INSTALACAO-DOCKER.md](./INSTALACAO-DOCKER.md) se não tiver)
- Conta no Docker Hub (crie em https://hub.docker.com/)
- Estar logado no Docker Hub (`docker login`)

### Verificar se o Docker está instalado

```bash
docker --version
```

Se aparecer "command not found", você precisa instalar o Docker primeiro.

## Construção e Publicação

### Método 1: Usando o script automatizado

1. Torne o script executável:
```bash
chmod +x docker-build.sh
```

2. Execute o script com seu username do Docker Hub:
```bash
./docker-build.sh -u SEU_USERNAME -t v1.0.0
```

Opções disponíveis:
- `-u, --username`: Username do Docker Hub (obrigatório para push)
- `-t, --tag`: Tag da imagem (padrão: latest)
- `-b, --build-only`: Apenas construir, sem fazer push
- `-h, --help`: Exibir ajuda

### Método 2: Comandos manuais

1. Construir a imagem:
```bash
docker build -t SEU_USERNAME/rpa-lais:latest .
```

2. Fazer push para o Docker Hub:
```bash
docker push SEU_USERNAME/rpa-lais:latest
```

## Executando a imagem

### Execução básica:
```bash
docker run --rm SEU_USERNAME/rpa-lais:latest
```

### Execução com volume para salvar os arquivos JSON:
```bash
docker run --rm -v $(pwd)/output:/app/output SEU_USERNAME/rpa-lais:latest
```

### Execução com variáveis de ambiente (se necessário):
```bash
docker run --rm \
  -v $(pwd)/output:/app/output \
  -e DISPLAY=:99 \
  SEU_USERNAME/rpa-lais:latest
```

## Estrutura da imagem

- **Base**: `node:18-slim`
- **Dependências**: Chromium e bibliotecas necessárias para Puppeteer
- **Diretório de trabalho**: `/app`
- **Arquivos de saída**: `/app/output` (montar como volume)

## Notas

- A imagem inclui todas as dependências do sistema necessárias para o Puppeteer
- Os arquivos JSON gerados serão salvos no diretório `/app/output` dentro do container
- Para ver os logs em tempo real, use `docker run` sem a flag `-d`

## Troubleshooting

### Erro de permissão
Se encontrar erros de permissão, tente executar com `--privileged`:
```bash
docker run --rm --privileged -v $(pwd)/output:/app/output SEU_USERNAME/rpa-lais:latest
```

### Chromium não encontrado
Se o Chromium não for encontrado, verifique se a imagem foi construída corretamente e se todas as dependências foram instaladas.

