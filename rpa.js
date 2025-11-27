const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function rpaLogin() {
  let browser;
  
  try {
    console.log('Iniciando o navegador...');
    // Detecta se está rodando no Docker (headless necessário)
    const isDocker = process.env.DOCKER === 'true' || process.env.CI === 'true' || !process.env.DISPLAY;
    
    // Inicia o navegador (headless no Docker, visível localmente)
    const launchOptions = {
      headless: isDocker ? 'new' : false,
      args: isDocker ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ] : ['--start-maximized']
    };
    
    if (!isDocker) {
      launchOptions.defaultViewport = null;
    }
    
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    
    // Variável para armazenar o token de autorização
    let authToken = null;
    
    // Variável para controlar se a mensagem do QR code já foi exibida
    let qrCodeMessageShown = false;

    // Intercepta as requisições de rede para capturar o token
    page.on('request', (request) => {
      const headers = request.headers();
      if (headers['authorization'] && headers['authorization'].startsWith('Bearer')) {
        authToken = headers['authorization'];
        console.log('Token de autorização capturado da requisição!');
      }
    });
    
    // Função para detectar e exibir mensagem quando QR code aparecer
    const checkForQRCode = async () => {
      if (qrCodeMessageShown) return false;
      
      try {
        const hasQRCode = await page.evaluate(() => {
          // Procura por elementos comuns de QR code
          const qrSelectors = [
            'img[src*="qr"]',
            'img[src*="QR"]',
            'canvas',
            '[class*="qr"]',
            '[class*="QR"]',
            '[id*="qr"]',
            '[id*="QR"]',
            'svg[viewBox*="0 0"]' // SVGs podem conter QR codes
          ];
          
          // Verifica se algum elemento de QR code está visível
          for (const selector of qrSelectors) {
            try {
              const elements = document.querySelectorAll(selector);
              for (const el of elements) {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                  // Verifica se o elemento tem dimensões razoáveis (QR codes geralmente são quadrados)
                  const rect = el.getBoundingClientRect();
                  if (rect.width > 100 && rect.height > 100) {
                    return true;
                  }
                }
              }
            } catch (e) {
              // Ignora erros de seletores inválidos
            }
          }
          
          // Verifica também por texto relacionado a QR code
          const bodyText = document.body.innerText.toLowerCase();
          if (bodyText.includes('qr code') || bodyText.includes('qrcode') || bodyText.includes('escaneie')) {
            return true;
          }
          
          return false;
        });

        if (hasQRCode) {
          qrCodeMessageShown = true;
          console.log('\n' + '='.repeat(70));
          console.log('⚠️  QR CODE DETECTADO!');
          console.log('='.repeat(70));
          console.log('Após a leitura de QR Code, aguarde a confirmação de conexão no celular.');
          console.log('Após conectado, basta recarregar a página!');
          console.log('='.repeat(70) + '\n');
          
          // Exibe a mensagem também na página usando um alert visual
          await page.evaluate(() => {
            // Remove mensagem anterior se existir
            const existingMsg = document.getElementById('qr-code-message');
            if (existingMsg) {
              existingMsg.remove();
            }
            
            // Cria um elemento para exibir a mensagem
            const messageDiv = document.createElement('div');
            messageDiv.id = 'qr-code-message';
            messageDiv.style.cssText = `
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px 30px;
              border-radius: 10px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              z-index: 10000;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
              text-align: center;
              max-width: 600px;
              line-height: 1.6;
              animation: slideDown 0.5s ease-out;
            `;
            
            messageDiv.innerHTML = `
              <div style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">
                ⚠️ QR CODE DETECTADO
              </div>
              <div>
                Após a leitura de QR Code, aguarde a confirmação de conexão no celular.<br>
                Após conectado, basta recarregar a página!
              </div>
            `;
            
            // Adiciona animação CSS
            const style = document.createElement('style');
            style.textContent = `
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateX(-50%) translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(-50%) translateY(0);
                }
              }
            `;
            document.head.appendChild(style);
            document.body.appendChild(messageDiv);
          });
          
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    };
    
    // Monitora mudanças na página para detectar QR codes
    page.on('framenavigated', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await checkForQRCode();
    });
    
    console.log('Acessando o site https://casa.lais.ai/...');
    await page.goto('https://casa.lais.ai/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Aguarda o campo de username aparecer
    console.log('Aguardando o campo de username...');
    await page.waitForSelector('#username', { visible: true, timeout: 10000 });

    // Preenche o campo username
    console.log('Preenchendo o campo username...');
    await page.type('#username', 'ti@privateimoveis.com', { delay: 100 });

    // Aguarda o botão de login aparecer
    console.log('Aguardando o botão de login...');
    await page.waitForSelector('#kc-login', { visible: true, timeout: 10000 });

    // Clica no botão de login
    console.log('Clicando no botão de login...');
    await page.click('#kc-login');

    // Aguarda o campo de password aparecer após o clique
    console.log('Aguardando o campo de password...');
    await page.waitForSelector('#password', { visible: true, timeout: 10000 });

    // Preenche o campo password
    console.log('Preenchendo o campo password...');
    await page.type('#password', 'Pa@081200', { delay: 100 });

    // Aguarda o botão de login aparecer novamente
    console.log('Aguardando o botão de login...');
    await page.waitForSelector('#kc-login', { visible: true, timeout: 10000 });

    // Clica no botão de login para fazer o login
    console.log('Clicando no botão de login para fazer login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('#kc-login')
    ]);

    // Aguarda a tela carregar completamente
    console.log('Aguardando a tela carregar...');
    await page.waitForTimeout(3000);

    // Verifica se há QR code após o login
    await checkForQRCode();

    // Navega para a página de chats para capturar o token nas requisições
    console.log('Navegando para a página de chats para capturar o token...');
    await page.goto('https://casa.lais.ai/chats?agency=a7921a02-3477-4f4a-a85e-33e688df6976', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Verifica novamente após navegação
    await checkForQRCode();

    // Aguarda um pouco para as requisições acontecerem
    await page.waitForTimeout(5000);

    // Se ainda não capturou o token das requisições, tenta do localStorage
    if (!authToken) {
      console.log('Tentando capturar o token do localStorage...');
      const localStorageData = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const storage = {};
        keys.forEach(key => {
          storage[key] = localStorage.getItem(key);
        });
        return storage;
      });

      // Procura o token no localStorage
      for (const [key, value] of Object.entries(localStorageData)) {
        if (value) {
          // Procura por token JWT (começa com eyJ)
          const jwtMatch = value.match(/(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/);
          if (jwtMatch) {
            authToken = `Bearer ${jwtMatch[1]}`;
            console.log('Token encontrado no localStorage!');
            break;
          }
          // Procura por Bearer token
          const bearerMatch = value.match(/Bearer\s+([^\s"']+)/);
          if (bearerMatch) {
            authToken = bearerMatch[0];
            console.log('Token encontrado no localStorage (formato Bearer)!');
            break;
          }
        }
      }
    }

    // Se ainda não encontrou, tenta do sessionStorage
    if (!authToken) {
      console.log('Tentando capturar do sessionStorage...');
      const sessionStorageData = await page.evaluate(() => {
        const keys = Object.keys(sessionStorage);
        const storage = {};
        keys.forEach(key => {
          storage[key] = sessionStorage.getItem(key);
        });
        return storage;
      });

      for (const [key, value] of Object.entries(sessionStorageData)) {
        if (value) {
          const jwtMatch = value.match(/(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/);
          if (jwtMatch) {
            authToken = `Bearer ${jwtMatch[1]}`;
            console.log('Token encontrado no sessionStorage!');
            break;
          }
          const bearerMatch = value.match(/Bearer\s+([^\s"']+)/);
          if (bearerMatch) {
            authToken = bearerMatch[0];
            console.log('Token encontrado no sessionStorage (formato Bearer)!');
            break;
          }
        }
      }
    }

    // Tenta extrair o token das cookies também
    if (!authToken) {
      console.log('Tentando capturar das cookies...');
      const cookies = await page.cookies();
      for (const cookie of cookies) {
        if (cookie.value && cookie.value.includes('eyJ')) {
          const jwtMatch = cookie.value.match(/(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/);
          if (jwtMatch) {
            authToken = `Bearer ${jwtMatch[1]}`;
            console.log('Token encontrado nas cookies!');
            break;
          }
        }
      }
    }

    if (!authToken) {
      throw new Error('Token de autorização não encontrado. Verifique se o login foi realizado com sucesso.');
    }

    console.log('Token capturado com sucesso!');
    console.log('Token (primeiros 50 caracteres):', authToken.substring(0, 50) + '...');

    // Fecha o navegador
    await browser.close();

    // Função auxiliar para fazer requisição à API
    const makeApiRequest = async (pageNumber) => {
      const apiUrl = `https://bff.lastro.services/api/v1/web/chats/agency?limit=15&page=${pageNumber}&operation=rent`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'Connection': 'keep-alive',
          'Origin': 'https://app.lais.ai',
          'Referer': 'https://app.lais.ai/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
          'authorization': authToken,
          'sec-ch-ua': '"Chromium";v="142", "Microsoft Edge";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'x-agency-id': 'a7921a02-3477-4f4a-a85e-33e688df6976'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição da página ${pageNumber}: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    };

    // Faz a primeira requisição para obter informações de paginação
    console.log('Fazendo primeira requisição para obter informações de paginação...');
    const firstPageData = await makeApiRequest(1);
    
    if (!firstPageData.data || !firstPageData.data.pagination) {
      throw new Error('Resposta da API não contém informações de paginação');
    }

    const pagination = firstPageData.data.pagination;
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    console.log(`Total de registros: ${pagination.total}`);
    console.log(`Registros por página: ${pagination.limit}`);
    console.log(`Total de páginas: ${totalPages}`);

    // Array para armazenar todos os atendimentos
    const allChats = [...firstPageData.data.chats];
    console.log(`Página 1/${totalPages} - ${firstPageData.data.chats.length} atendimentos coletados`);

    // Faz requisições para as páginas restantes
    for (let page = 2; page <= totalPages; page++) {
      console.log(`Fazendo requisição para a página ${page}/${totalPages}...`);
      const pageData = await makeApiRequest(page);
      
      if (pageData.data && pageData.data.chats) {
        allChats.push(...pageData.data.chats);
        console.log(`Página ${page}/${totalPages} - ${pageData.data.chats.length} atendimentos coletados (Total: ${allChats.length})`);
      } else {
        console.warn(`Página ${page} não retornou dados de chats`);
      }
      
      // Pequeno delay entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\nTotal de atendimentos coletados: ${allChats.length}`);

    // Cria o objeto final com todos os atendimentos
    const finalData = {
      data: {
        chats: allChats,
        pagination: {
          total: allChats.length,
          totalPages: totalPages,
          limit: pagination.limit
        }
      },
      message: 'OK'
    };

    // Salva o resultado em um arquivo JSON
    const outputFile = 'atendimentos.json';
    await fs.writeFile(outputFile, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`\nTodos os dados salvos em ${outputFile}`);

    // Função para buscar mensagens de um atendimento (com paginação)
    const getChatMessages = async (chatId) => {
      const getMessagesPage = async (pageNumber) => {
        const messagesUrl = `https://bff.lastro.services/api/v1/web/chats/${chatId}/messages?page=${pageNumber}&limit=25&order_by=created_at&order_desc=true`;
        
        const response = await fetch(messagesUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Connection': 'keep-alive',
            'Origin': 'https://app.lais.ai',
            'Referer': 'https://app.lais.ai/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
            'authorization': authToken,
            'sec-ch-ua': '"Chromium";v="142", "Microsoft Edge";v="142", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'x-agency-id': 'a7921a02-3477-4f4a-a85e-33e688df6976'
          }
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar mensagens do chat ${chatId}, página ${pageNumber}: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      };

      // Busca a primeira página para obter informações de paginação
      const firstPage = await getMessagesPage(1);
      
      let allMessagesByDay = [];
      
      // Acessa data.chat.messages (estrutura correta)
      if (firstPage.data && firstPage.data.chat && firstPage.data.chat.messages) {
        allMessagesByDay = [...firstPage.data.chat.messages];
        
        // Verifica se há paginação
        if (firstPage.data.pagination) {
          const msgPagination = firstPage.data.pagination;
          const totalPages = Math.ceil(msgPagination.total / msgPagination.limit);
          
          // Busca as páginas restantes se houver
          if (totalPages > 1) {
            for (let page = 2; page <= totalPages; page++) {
              const pageData = await getMessagesPage(page);
              if (pageData.data && pageData.data.chat && pageData.data.chat.messages) {
                allMessagesByDay.push(...pageData.data.chat.messages);
              }
              // Pequeno delay entre requisições
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
      }
      
      // Processa as mensagens agrupadas por dia e extrai apenas os campos necessários
      const processedMessages = [];
      
      for (const dayGroup of allMessagesByDay) {
        const day = dayGroup.day;
        
        if (dayGroup.messages && Array.isArray(dayGroup.messages)) {
          for (const message of dayGroup.messages) {
            processedMessages.push({
              day: day,
              id: message.id,
              role: message.role,
              content: message.content,
              status: message.status,
              leadOrigin: message.metadata && message.metadata.leadOrigin ? message.metadata.leadOrigin : null
            });
          }
        }
      }
      
      return processedMessages;
    };

    // Busca mensagens de todos os atendimentos
    console.log('\n=== Iniciando coleta de mensagens ===');
    const messagesData = {};
    const totalChats = allChats.length;
    
    for (let i = 0; i < totalChats; i++) {
      const chat = allChats[i];
      const chatId = chat.id;
      
      console.log(`\n[${i + 1}/${totalChats}] Buscando mensagens do atendimento ${chatId}...`);
      
      try {
        const messages = await getChatMessages(chatId);
        messagesData[chatId] = messages;
        console.log(`  ✓ ${messages.length} mensagens coletadas`);
      } catch (error) {
        console.error(`  ✗ Erro ao buscar mensagens: ${error.message}`);
        messagesData[chatId] = [];
      }
      
      // Pequeno delay entre atendimentos
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Salva as mensagens em um arquivo JSON
    const messagesFile = 'mensagens.json';
    const messagesOutput = {
      data: messagesData,
      totalChats: Object.keys(messagesData).length,
      totalMessages: Object.values(messagesData).reduce((sum, msgs) => sum + msgs.length, 0)
    };
    
    await fs.writeFile(messagesFile, JSON.stringify(messagesOutput, null, 2), 'utf8');
    console.log(`\n✓ Todas as mensagens salvas em ${messagesFile}`);
    console.log(`  Total de atendimentos processados: ${messagesOutput.totalChats}`);
    console.log(`  Total de mensagens coletadas: ${messagesOutput.totalMessages}`);

    console.log('\nProcesso concluído com sucesso!');

    // Retorna os dados ao invés de apenas salvar em arquivo
    return {
      atendimentos: finalData,
      mensagens: messagesOutput,
      success: true
    };

  } catch (error) {
    console.error('Erro durante a execução:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Exporta a função para uso como módulo
module.exports = rpaLogin;

// Se executado diretamente, roda o script normalmente
if (require.main === module) {
  rpaLogin()
    .then((result) => {
      if (result) {
        console.log('Script finalizado com sucesso!');
        console.log(`Total de atendimentos: ${result.atendimentos.data.chats.length}`);
        console.log(`Total de mensagens: ${result.mensagens.totalMessages}`);
      } else {
        console.log('Script finalizado.');
      }
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}
