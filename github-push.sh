#!/bin/bash

# Script para fazer push do código para o GitHub

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Configurando repositório GitHub ===${NC}"
echo ""

# Verifica se já existe um remote
if git remote | grep -q "origin"; then
    echo "Remote 'origin' já existe."
    git remote -v
    echo ""
    read -p "Deseja atualizar a URL? (s/n): " update
    if [ "$update" = "s" ] || [ "$update" = "S" ]; then
        read -p "Digite a URL do repositório GitHub (ex: https://github.com/usuario/rpa-lais.git): " repo_url
        git remote set-url origin "$repo_url"
    fi
else
    read -p "Digite a URL do repositório GitHub (ex: https://github.com/usuario/rpa-lais.git): " repo_url
    git remote add origin "$repo_url"
fi

echo ""
echo -e "${GREEN}=== Fazendo push para o GitHub ===${NC}"
echo ""

# Faz push para o branch main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Código enviado para o GitHub com sucesso!${NC}"
    echo ""
    echo "Repositório disponível em:"
    git remote get-url origin
else
    echo ""
    echo -e "${YELLOW}Erro ao fazer push. Verifique:${NC}"
    echo "1. Se o repositório foi criado no GitHub"
    echo "2. Se você tem permissão para fazer push"
    echo "3. Se está autenticado no GitHub (git config ou SSH keys)"
    echo ""
    echo "Para criar o repositório no GitHub:"
    echo "1. Acesse: https://github.com/new"
    echo "2. Nome do repositório: rpa-lais"
    echo "3. NÃO inicialize com README, .gitignore ou license"
    echo "4. Clique em 'Create repository'"
    echo "5. Execute este script novamente"
fi

