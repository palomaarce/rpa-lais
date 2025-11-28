# Instruções para Subir no GitHub

## Opção 1: Usando o Script Automatizado (Recomendado)

1. **Crie o repositório no GitHub:**
   - Acesse: https://github.com/new
   - Nome do repositório: `rpa-lais`
   - Descrição: "RPA para automação de coleta de atendimentos e mensagens do sistema LAIS"
   - Escolha se será público ou privado
   - **NÃO** marque "Initialize this repository with a README"
   - Clique em "Create repository"

2. **Execute o script:**
   ```bash
   ./github-push.sh
   ```

3. **Digite a URL do repositório quando solicitado:**
   - Exemplo: `https://github.com/SEU_USUARIO/rpa-lais.git`
   - Ou SSH: `git@github.com:SEU_USUARIO/rpa-lais.git`

## Opção 2: Comandos Manuais

### 1. Criar repositório no GitHub

- Acesse: https://github.com/new
- Crie o repositório (sem inicializar com arquivos)

### 2. Adicionar remote e fazer push

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/rpa-lais.git

# Ou usando SSH (se configurado)
git remote add origin git@github.com:SEU_USUARIO/rpa-lais.git

# Fazer push
git branch -M main
git push -u origin main
```

## Autenticação no GitHub

### Método 1: Personal Access Token (HTTPS)

1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione as permissões: `repo`
4. Copie o token gerado
5. Use o token como senha quando o Git pedir credenciais

### Método 2: SSH Keys (Recomendado)

1. **Gerar chave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "seu_email@example.com"
   ```

2. **Adicionar chave ao ssh-agent:**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Copiar chave pública:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. **Adicionar no GitHub:**
   - Vá em: https://github.com/settings/keys
   - Clique em "New SSH key"
   - Cole a chave pública

5. **Usar URL SSH ao adicionar remote:**
   ```bash
   git remote add origin git@github.com:SEU_USUARIO/rpa-lais.git
   ```

## Verificar se funcionou

Após o push, acesse seu repositório no GitHub:
```
https://github.com/SEU_USUARIO/rpa-lais
```

Você deve ver todos os arquivos do projeto.

## Próximos Passos

Após subir no GitHub, você pode:

1. **Adicionar descrição e tags** no repositório
2. **Configurar GitHub Actions** para CI/CD (opcional)
3. **Adicionar issues e projetos** para gerenciamento
4. **Criar releases** quando fizer atualizações importantes

## Troubleshooting

### Erro: "remote origin already exists"
```bash
# Ver remotes existentes
git remote -v

# Remover e adicionar novamente
git remote remove origin
git remote add origin SUA_URL
```

### Erro: "Permission denied"
- Verifique se está autenticado
- Use Personal Access Token ou configure SSH keys
- Verifique se tem permissão no repositório

### Erro: "Repository not found"
- Verifique se o repositório foi criado no GitHub
- Confirme o nome do usuário e repositório
- Verifique se tem acesso ao repositório

