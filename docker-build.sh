#!/bin/bash

# Script para construir e fazer push da imagem Docker para o Docker Hub

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
IMAGE_NAME="rpa-lais"
DOCKER_USERNAME=""  # Substitua pelo seu username do Docker Hub
VERSION="latest"

# Função para exibir ajuda
show_help() {
    echo "Uso: ./docker-build.sh [opções]"
    echo ""
    echo "Opções:"
    echo "  -u, --username USERNAME   Username do Docker Hub (obrigatório)"
    echo "  -t, --tag TAG            Tag da imagem (padrão: latest)"
    echo "  -b, --build-only         Apenas construir a imagem, não fazer push"
    echo "  -h, --help               Exibir esta ajuda"
    echo ""
    echo "Exemplo:"
    echo "  ./docker-build.sh -u meuusername -t v1.0.0"
}

# Parse dos argumentos
BUILD_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--username)
            DOCKER_USERNAME="$2"
            shift 2
            ;;
        -t|--tag)
            VERSION="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Verifica se o username foi fornecido
if [ -z "$DOCKER_USERNAME" ] && [ "$BUILD_ONLY" = false ]; then
    echo -e "${YELLOW}Erro: Username do Docker Hub é obrigatório para fazer push${NC}"
    echo "Use: ./docker-build.sh -u SEU_USERNAME"
    exit 1
fi

# Nome completo da imagem
if [ -n "$DOCKER_USERNAME" ]; then
    FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$VERSION"
fi

echo -e "${GREEN}=== Construindo imagem Docker ===${NC}"
echo "Imagem: $FULL_IMAGE_NAME"
echo ""

# Constrói a imagem
docker build -t "$FULL_IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Erro ao construir a imagem${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Imagem construída com sucesso!${NC}"
echo ""

# Faz push se não for apenas build
if [ "$BUILD_ONLY" = false ]; then
    echo -e "${GREEN}=== Fazendo push para o Docker Hub ===${NC}"
    echo ""
    
    # Verifica se o usuário está logado
    if ! docker info | grep -q "Username"; then
        echo -e "${YELLOW}Aviso: Você precisa estar logado no Docker Hub${NC}"
        echo "Execute: docker login"
        exit 1
    fi
    
    docker push "$FULL_IMAGE_NAME"
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Erro ao fazer push da imagem${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✓ Imagem enviada para o Docker Hub com sucesso!${NC}"
    echo ""
    echo "Para executar a imagem:"
    echo "  docker run --rm -v \$(pwd)/output:/app/output $FULL_IMAGE_NAME"
else
    echo ""
    echo "Para fazer push da imagem, execute:"
    echo "  docker push $FULL_IMAGE_NAME"
    echo ""
    echo "Para executar a imagem:"
    echo "  docker run --rm -v \$(pwd)/output:/app/output $FULL_IMAGE_NAME"
fi

