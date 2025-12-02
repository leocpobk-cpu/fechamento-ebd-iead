// Sistema de Autenticação e Controle de Acesso
// Níveis: 1=Admin, 2=Diretoria EBD, 3=Auxiliar

// Contador de tentativas de login
let tentativasLogin = 0;
const MAX_TENTATIVAS = 3;

// Igrejas padrão
const igrejaspadrao = [
    {
        id: 1,
        nome: 'IEAD - Sede',
        endereco: 'Rua Central, 100',
        cidade: 'Cidade',
        uf: 'UF',
        pastor: 'Pastor Titular',
        ativo: true
    },
    {
        id: 2,
        nome: 'IEAD - Coophmil',
        endereco: 'Av. Coophmil, 200',
        cidade: 'Cidade',
        uf: 'UF',
        pastor: 'Pastor Local',
        ativo: true
    },
    {
        id: 3,
        nome: 'IEAD - Cidade Alta',
        endereco: 'Rua Cidade Alta, 300',
        cidade: 'Cidade',
        uf: 'UF',
        pastor: 'Pastor Local',
        ativo: true
    },
    {
        id: 4,
        nome: 'IEAD - Temp (Solicitar Cadastro)',
        endereco: 'Endereço Temporário',
        cidade: 'Cidade',
        uf: 'UF',
        pastor: 'A definir',
        ativo: true
    }
];

// Usuários padrão (em produção, usar backend real)
const usuariosPadrao = [
    {
        id: 1,
        usuario: 'admin',
        senha: 'admin123',
        nome: 'Administrador',
        email: 'admin@iead.com',
        celular: '(11) 99999-9999',
        nivel: 1, // Admin - acesso total
        igrejaId: null, // Admin vê todas as igrejas
        ativo: true,
        primeiroAcesso: true
    },
    {
        id: 2,
        usuario: 'diretoria',
        senha: 'dir123',
        nome: 'Diretoria EBD',
        email: 'diretoria@iead.com',
        celular: '(11) 98888-8888',
        nivel: 2, // Diretoria - lançamento e visualização
        igrejaId: null, // Será definida no primeiro acesso
        ativo: true,
        primeiroAcesso: true
    },
    {
        id: 3,
        usuario: 'auxiliar',
        senha: 'aux123',
        nome: 'Auxiliar',
        email: 'auxiliar@iead.com',
        celular: '(11) 97777-7777',
        nivel: 3, // Auxiliar - apenas visualização
        igrejaId: null, // Será definida no primeiro acesso
        ativo: true,
        primeiroAcesso: true
    }
];

// Inicializar igrejas no localStorage
function inicializarIgrejas() {
    if (!localStorage.getItem('igrejasEBD')) {
        localStorage.setItem('igrejasEBD', JSON.stringify(igrejaspadrao));
    }
}

// Inicializar usuários no localStorage
function inicializarUsuarios() {
    if (!localStorage.getItem('usuariosEBD')) {
        localStorage.setItem('usuariosEBD', JSON.stringify(usuariosPadrao));
    }
}

// Obter todas as igrejas
function getIgrejas() {
    return JSON.parse(localStorage.getItem('igrejasEBD') || '[]');
}

// Salvar igrejas
function salvarIgrejas(igrejas) {
    localStorage.setItem('igrejasEBD', JSON.stringify(igrejas));
}

// Obter igreja do usuário logado
function getIgrejaUsuarioLogado() {
    const usuario = getUsuarioLogado();
    if (!usuario) return null;
    
    // Admin pode escolher qual igreja visualizar
    if (usuario.nivel === 1) {
        const igrejaVisualizacao = sessionStorage.getItem('igrejaVisualizacaoAdmin');
        return igrejaVisualizacao ? parseInt(igrejaVisualizacao) : null;
    }
    
    // Outros usuários veem apenas sua igreja
    return usuario.igrejaId;
    return usuario.igrejaId;
}

// Obter todos os usuários
function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuariosEBD') || '[]');
}

// Salvar usuários
function salvarUsuarios(usuarios) {
    localStorage.setItem('usuariosEBD', JSON.stringify(usuarios));
}

// Obter usuário logado
function getUsuarioLogado() {
    return JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');
}

// Fazer login
function fazerLogin() {
    const usuario = document.getElementById('input-usuario').value.trim();
    const senha = document.getElementById('input-senha').value;
    const btnLogin = document.querySelector('.btn-login');
    
    console.log('🔐 Tentativa de login:', {usuario, senhaLength: senha?.length});
    
    if (!usuario || !senha) {
        mostrarAlertaLogin('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Mostrar estado de carregamento
    if (btnLogin) {
        btnLogin.textContent = 'Entrando...';
        btnLogin.disabled = true;
    }
    
    // Delay pequeno para melhor UX em mobile
    setTimeout(() => {
        const usuarios = getUsuarios();
        console.log('👥 Total de usuários:', usuarios.length);
        console.log('🔍 Procurando por:', usuario);
        
        const usuarioEncontrado = usuarios.find(u => {
            const match = u.usuario.toLowerCase() === usuario.toLowerCase() && 
                         u.senha === senha &&
                         u.ativo;
            console.log(`Verificando ${u.usuario}: usuario=${u.usuario.toLowerCase() === usuario.toLowerCase()}, senha=${u.senha === senha}, ativo=${u.ativo}`);
            return match;
        });
        
        if (usuarioEncontrado) {
            console.log('✅ Usuário encontrado:', usuarioEncontrado.usuario);
            
            // Verificar se é primeiro acesso
            if (usuarioEncontrado.primeiroAcesso) {
                console.log('🆕 Primeiro acesso detectado');
                // Salvar dados temporários incluindo o nível
                sessionStorage.setItem('usuarioPrimeiroAcesso', JSON.stringify({
                    id: usuarioEncontrado.id,
                    usuario: usuarioEncontrado.usuario,
                    nome: usuarioEncontrado.nome,
                    nivel: usuarioEncontrado.nivel
                }));
                
                // Restaurar botão
                if (btnLogin) {
                    btnLogin.textContent = 'ENTRAR';
                    btnLogin.disabled = false;
                }
                
                // Mostrar tela de primeiro acesso
                mostrarTelaPrimeiroAcesso();
                return;
            }
            
            // Resetar tentativas
            tentativasLogin = 0;
            
            // Salvar sessão
            const sessao = {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                nome: usuarioEncontrado.nome,
                nivel: usuarioEncontrado.nivel,
                igrejaId: usuarioEncontrado.igrejaId,
                loginEm: new Date().toISOString()
            };
            sessionStorage.setItem('usuarioLogado', JSON.stringify(sessao));
            
            console.log('💾 Sessão salva:', sessao);
            
            // Esconder login e mostrar sistema
            document.getElementById('tela-login').style.display = 'none';
            document.getElementById('sistema-principal').style.display = 'block';
            
            // Atualizar header com info do usuário
            atualizarHeaderUsuario(sessao);
            
            // Aplicar permissões
            aplicarPermissoes(sessao.nivel);
            
            // Inicializar swipe em dispositivos móveis
            if (window.innerWidth <= 768 && typeof inicializarSwipe === 'function') {
                setTimeout(() => inicializarSwipe(), 100);
            }
            
            mostrarAlertaLogin('Login realizado com sucesso!', 'success');
        } else {
            console.error('❌ Usuário não encontrado ou credenciais inválidas');
            
            // Incrementar tentativas
            tentativasLogin++;
            
            // Restaurar botão
            if (btnLogin) {
                btnLogin.textContent = 'ENTRAR';
                btnLogin.disabled = false;
            }
            
            // Verificar se atingiu o máximo de tentativas
            if (tentativasLogin >= MAX_TENTATIVAS) {
                const desejaRecuperar = confirm(
                    `Você errou a senha ${MAX_TENTATIVAS} vezes.\n\nDeseja redefinir sua senha?`
                );
                
                if (desejaRecuperar) {
                    // Resetar contador e ir para recuperação
                    tentativasLogin = 0;
                    mudarTelaLogin('recuperacao');
                    // Pré-preencher o usuário
                    const inputRecupUsuario = document.getElementById('input-recup-usuario');
                    if (inputRecupUsuario) {
                        inputRecupUsuario.value = usuario;
                    }
                } else {
                    // Resetar contador para nova tentativa
                    tentativasLogin = 0;
                }
            } else {
                // Mostrar tentativas restantes
                const restantes = MAX_TENTATIVAS - tentativasLogin;
                mostrarAlertaLogin(
                    `Usuário ou senha inválidos!\nTentativa ${tentativasLogin} de ${MAX_TENTATIVAS} (${restantes} restante${restantes !== 1 ? 's' : ''})\n\n💡 Dica: Senha padrão do admin é "admin123"`, 
                    'error'
                );
            }
        }
    }, 300);
}

// Fazer logout
function fazerLogout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        sessionStorage.removeItem('usuarioLogado');
        sessionStorage.removeItem('codigoRecuperacao');
        location.reload();
    }
}

// Atualizar header com informações do usuário
function atualizarHeaderUsuario(usuario) {
    const niveis = {
        1: 'Administrador',
        2: 'Diretoria EBD',
        3: 'Auxiliar'
    };
    
    document.getElementById('nome-usuario').textContent = usuario.nome;
    document.getElementById('role-usuario').textContent = niveis[usuario.nivel];
    
    // Mostrar igreja do usuário (exceto Admin)
    const igrejaSpan = document.getElementById('igreja-usuario');
    if (igrejaSpan) {
        if (usuario.nivel === 1) {
            igrejaSpan.textContent = '';
        } else if (usuario.igrejaId) {
            const igrejas = getIgrejas();
            const igreja = igrejas.find(i => i.id === usuario.igrejaId);
            if (igreja) {
                igrejaSpan.textContent = `🏛️ ${igreja.nome}`;
            }
        }
    }
    
    // Carregar seletor de igreja para Admin
    if (usuario.nivel === 1) {
        carregarSeletorIgrejaAdmin();
    }
}

// Carregar seletor de igreja para Admin visualizar dados
function carregarSeletorIgrejaAdmin() {
    const select = document.getElementById('select-igreja-admin');
    if (!select) return;
    
    const igrejas = getIgrejas().filter(i => i.ativo);
    select.innerHTML = '<option value="">Todas as Igrejas</option>' +
        igrejas.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');
    
    select.style.display = 'block';
    
    // Restaurar seleção anterior se existir
    const igrejaVisualizacao = sessionStorage.getItem('igrejaVisualizacaoAdmin');
    if (igrejaVisualizacao) {
        select.value = igrejaVisualizacao;
    }
}

// Trocar igreja sendo visualizada pelo Admin
function trocarIgrejaAdmin() {
    const select = document.getElementById('select-igreja-admin');
    if (!select) return;
    
    const igrejaId = select.value;
    
    if (igrejaId) {
        sessionStorage.setItem('igrejaVisualizacaoAdmin', igrejaId);
        const igrejas = getIgrejas();
        const igreja = igrejas.find(i => i.id == igrejaId);
        alert(`📊 Visualizando dados de: ${igreja ? igreja.nome : 'Igreja não encontrada'}\n\nOs lançamentos, histórico e relatórios agora mostrarão apenas os dados desta igreja.`);
    } else {
        sessionStorage.removeItem('igrejaVisualizacaoAdmin');
        alert('📊 Visualizando dados de: Todas as Igrejas\n\nOs lançamentos, histórico e relatórios agora mostrarão dados de todas as igrejas.');
    }
    
    // Recarregar tela atual para atualizar dados
    const telaAtiva = document.querySelector('.tela.active');
    if (telaAtiva) {
        const telaId = telaAtiva.id.replace('tela-', '');
        if (typeof window[`carregar${telaId.charAt(0).toUpperCase() + telaId.slice(1)}`] === 'function') {
            window[`carregar${telaId.charAt(0).toUpperCase() + telaId.slice(1)}`]();
        }
    }
}

// Aplicar permissões baseadas no nível
function aplicarPermissoes(nivel) {
    const elementos = {
        // Botões de ação (apenas Admin e Diretoria)
        botoes: document.querySelectorAll('#btn-gerar, .btn-editar, .btn-excluir, .btn-salvar'),
        // Inputs de formulário (apenas Admin e Diretoria)
        inputs: document.querySelectorAll('#tela-lancamento input, #tela-lancamento select, #tela-lancamento textarea'),
        // Aba de Lições (apenas Admin)
        abaLicoes: document.querySelectorAll('.nav-tab')[4],
        // Configurações (apenas Admin)
        btnConfig: document.querySelector('[onclick="mostrarConfig()"]')
    };
    
    if (nivel === 3) {
        // Auxiliar: APENAS visualização
        elementos.botoes.forEach(btn => btn.style.display = 'none');
        elementos.inputs.forEach(input => input.disabled = true);
        if (elementos.abaLicoes) elementos.abaLicoes.style.display = 'none';
        if (elementos.btnConfig) elementos.btnConfig.style.display = 'none';
        
        // Esconder botão "Gerar Fechamento"
        const btnGerar = document.getElementById('btn-gerar');
        if (btnGerar) btnGerar.style.display = 'none';
        
    } else if (nivel === 2) {
        // Diretoria: lançamento e visualização
        if (elementos.abaLicoes) elementos.abaLicoes.style.display = 'none';
        if (elementos.btnConfig) elementos.btnConfig.style.display = 'none';
        
        // Esconder aba de usuários
        const abaUsuarios = document.getElementById('aba-usuarios');
        if (abaUsuarios) abaUsuarios.style.display = 'none';
        
    } else if (nivel === 1) {
        // Admin: acesso total
        console.log('👑 Aplicando permissões de Admin...');
        
        // Mostrar aba de Usuários
        const abaUsuarios = document.getElementById('aba-usuarios');
        if (abaUsuarios) {
            abaUsuarios.style.display = 'block';
            console.log('✅ Aba de usuários exibida');
        } else {
            console.error('❌ Elemento #aba-usuarios não encontrado');
        }
        
        // Mostrar botão de usuários no header
        const btnUsuarios = document.getElementById('btn-usuarios');
        if (btnUsuarios) {
            btnUsuarios.style.display = 'block';
            console.log('✅ Botão de usuários no header exibido');
        } else {
            console.error('❌ Elemento #btn-usuarios não encontrado');
        }
    }
}

// Mostrar tela de recuperação de senha
function mostrarRecuperacao() {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-recuperacao').style.display = 'block';
}

// Mostrar tela de primeiro acesso
function mostrarTelaPrimeiroAcesso() {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-primeiro-acesso').style.display = 'block';
    
    const usuario = JSON.parse(sessionStorage.getItem('usuarioPrimeiroAcesso'));
    if (usuario) {
        document.getElementById('nome-usuario-primeiro-acesso').textContent = usuario.nome;
        
        // Carregar igrejas no select (exceto para Admin)
        if (usuario.nivel !== 1) {
            const selectIgreja = document.getElementById('select-igreja-primeiro-acesso');
            const campoIgreja = document.getElementById('campo-igreja-primeiro-acesso');
            
            if (selectIgreja && campoIgreja) {
                const igrejas = getIgrejas().filter(i => i.ativo);
                selectIgreja.innerHTML = '<option value="">Selecione sua igreja</option>' +
                    igrejas.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');
                campoIgreja.style.display = 'block';
            }
        } else {
            // Admin não precisa selecionar igreja
            const campoIgreja = document.getElementById('campo-igreja-primeiro-acesso');
            if (campoIgreja) campoIgreja.style.display = 'none';
        }
    }
}

// Trocar senha no primeiro acesso
function trocarSenhaPrimeiroAcesso() {
    const novaSenha = document.getElementById('input-nova-senha-primeiro').value;
    const confirmaSenha = document.getElementById('input-confirma-senha-primeiro').value;
    const usuarioTemp = JSON.parse(sessionStorage.getItem('usuarioPrimeiroAcesso'));
    
    if (!usuarioTemp) {
        mostrarAlertaLogin('Sessão expirada. Faça login novamente.', 'error');
        voltarLogin();
        return;
    }
    
    // Verificar igreja para não-admins
    let igrejaId = null;
    if (usuarioTemp.nivel !== 1) {
        const selectIgreja = document.getElementById('select-igreja-primeiro-acesso');
        igrejaId = selectIgreja ? parseInt(selectIgreja.value) : null;
        
        if (!igrejaId) {
            mostrarAlertaLogin('Por favor, selecione sua igreja!', 'error');
            return;
        }
    }
    
    if (!novaSenha || !confirmaSenha) {
        mostrarAlertaLogin('Preencha todos os campos!', 'error');
        return;
    }
    
    if (novaSenha.length < 6) {
        mostrarAlertaLogin('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    if (novaSenha !== confirmaSenha) {
        mostrarAlertaLogin('As senhas não coincidem!', 'error');
        return;
    }
    
    // Atualizar senha e igreja do usuário
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioTemp.id);
    
    if (index !== -1) {
        usuarios[index].senha = novaSenha;
        usuarios[index].primeiroAcesso = false;
        
        // Salvar igreja se não for Admin
        if (usuarioTemp.nivel !== 1 && igrejaId) {
            usuarios[index].igrejaId = igrejaId;
        }
        
        salvarUsuarios(usuarios);
        
        mostrarAlertaLogin('✅ Senha alterada com sucesso! Faça login com a nova senha.', 'success');
        
        setTimeout(() => {
            sessionStorage.removeItem('usuarioPrimeiroAcesso');
            voltarLogin();
        }, 2000);
    } else {
        mostrarAlertaLogin('Erro ao atualizar senha. Tente novamente.', 'error');
    }
}

// Voltar ao login
function voltarLogin() {
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('form-recuperacao').style.display = 'none';
    document.getElementById('form-codigo').style.display = 'none';
    document.getElementById('form-primeiro-acesso').style.display = 'none';
    limparFormularios();
}

// Enviar código de recuperação
function enviarRecuperacao() {
    const usuario = document.getElementById('input-usuario-recuperacao').value.trim();
    const contato = document.getElementById('input-contato-recuperacao').value.trim();
    
    if (!usuario || !contato) {
        mostrarAlertaLogin('Preencha todos os campos!', 'error');
        return;
    }
    
    const usuarios = getUsuarios();
    const usuarioEncontrado = usuarios.find(u => 
        u.usuario.toLowerCase() === usuario.toLowerCase() &&
        (u.email.toLowerCase() === contato.toLowerCase() || u.celular === contato)
    );
    
    if (usuarioEncontrado) {
        // Gerar código aleatório de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salvar código temporariamente (em produção, enviar por email/SMS real)
        sessionStorage.setItem('codigoRecuperacao', JSON.stringify({
            usuario: usuarioEncontrado.usuario,
            codigo: codigo,
            expira: Date.now() + 15 * 60 * 1000 // 15 minutos
        }));
        
        // Simular envio
        mostrarAlertaLogin(`Código enviado para ${contato.includes('@') ? 'email' : 'celular'}:\n${codigo}`, 'success');
        
        // Mostrar formulário de código
        setTimeout(() => {
            document.getElementById('form-recuperacao').style.display = 'none';
            document.getElementById('form-codigo').style.display = 'block';
        }, 2000);
    } else {
        mostrarAlertaLogin('Usuário não encontrado ou contato não corresponde!', 'error');
    }
}

// Redefinir senha
function redefinirSenha() {
    const codigo = document.getElementById('input-codigo').value.trim();
    const novaSenha = document.getElementById('input-nova-senha').value;
    const confirmaSenha = document.getElementById('input-confirma-senha').value;
    
    if (!codigo || !novaSenha || !confirmaSenha) {
        mostrarAlertaLogin('Preencha todos os campos!', 'error');
        return;
    }
    
    if (novaSenha !== confirmaSenha) {
        mostrarAlertaLogin('As senhas não coincidem!', 'error');
        return;
    }
    
    if (novaSenha.length < 6) {
        mostrarAlertaLogin('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    const recuperacao = JSON.parse(sessionStorage.getItem('codigoRecuperacao') || 'null');
    
    if (!recuperacao) {
        mostrarAlertaLogin('Sessão expirada! Solicite um novo código.', 'error');
        voltarLogin();
        return;
    }
    
    if (Date.now() > recuperacao.expira) {
        mostrarAlertaLogin('Código expirado! Solicite um novo código.', 'error');
        sessionStorage.removeItem('codigoRecuperacao');
        voltarLogin();
        return;
    }
    
    if (codigo !== recuperacao.codigo) {
        mostrarAlertaLogin('Código inválido!', 'error');
        return;
    }
    
    // Atualizar senha
    const usuarios = getUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.usuario === recuperacao.usuario);
    
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].senha = novaSenha;
        salvarUsuarios(usuarios);
        
        mostrarAlertaLogin('Senha redefinida com sucesso!', 'success');
        sessionStorage.removeItem('codigoRecuperacao');
        
        setTimeout(() => {
            voltarLogin();
        }, 2000);
    }
}

// Mostrar alerta no formulário de login
function mostrarAlertaLogin(mensagem, tipo) {
    const forms = document.querySelectorAll('.login-form');
    forms.forEach(form => {
        if (form.style.display !== 'none') {
            let alerta = form.querySelector('.alert-login');
            if (!alerta) {
                alerta = document.createElement('div');
                alerta.className = 'alert-login';
                form.insertBefore(alerta, form.firstChild);
            }
            alerta.className = `alert-login ${tipo}`;
            alerta.textContent = mensagem;
            
            if (tipo === 'success') {
                setTimeout(() => alerta.remove(), 3000);
            }
        }
    });
}

// Limpar formulários
function limparFormularios() {
    document.getElementById('input-usuario').value = '';
    document.getElementById('input-senha').value = '';
    document.getElementById('input-usuario-recuperacao').value = '';
    document.getElementById('input-contato-recuperacao').value = '';
    document.getElementById('input-codigo').value = '';
    document.getElementById('input-nova-senha').value = '';
    document.getElementById('input-confirma-senha').value = '';
    
    const alertas = document.querySelectorAll('.alert-login');
    alertas.forEach(a => a.remove());
}

// Verificar autenticação ao carregar página
function verificarAutenticacao() {
    const usuarioLogado = getUsuarioLogado();
    
    if (usuarioLogado) {
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('sistema-principal').style.display = 'block';
        atualizarHeaderUsuario(usuarioLogado);
        aplicarPermissoes(usuarioLogado.nivel);
        
        // Inicializar swipe em dispositivos móveis
        if (window.innerWidth <= 768 && typeof inicializarSwipe === 'function') {
            setTimeout(() => inicializarSwipe(), 100);
        }
    } else {
        document.getElementById('tela-login').style.display = 'flex';
        document.getElementById('sistema-principal').style.display = 'none';
    }
}

// Adicionar event listeners para Enter nos inputs
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado - Inicializando sistema...');
    
    inicializarIgrejas();
    inicializarUsuarios();
    verificarAutenticacao();
    
    console.log('✅ Sistema inicializado');
    console.log('📝 Funções disponíveis:', {
        fazerLogin: typeof window.fazerLogin,
        mostrarRecuperacao: typeof window.mostrarRecuperacao,
        voltarLogin: typeof window.voltarLogin
    });
    
    // Enter no login
    document.getElementById('input-senha')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerLogin();
    });
    
    // Enter na recuperação
    document.getElementById('input-contato-recuperacao')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enviarRecuperacao();
    });
    
    // Enter na redefinição
    document.getElementById('input-confirma-senha')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') redefinirSenha();
    });
    
    // Mudar visibilidade do campo igreja quando mudar nível
    document.getElementById('modal-nivel')?.addEventListener('change', function() {
        const campoIgreja = document.getElementById('campo-igreja');
        if (this.value === '1') {
            campoIgreja.style.display = 'none';
        } else {
            campoIgreja.style.display = 'block';
            carregarSelectIgrejas();
        }
    });
});

// Expor funções globalmente para uso inline no HTML
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.mostrarRecuperacao = mostrarRecuperacao;
window.voltarLogin = voltarLogin;
window.enviarRecuperacao = enviarRecuperacao;
window.redefinirSenha = redefinirSenha;
window.trocarSenhaPrimeiroAcesso = trocarSenhaPrimeiroAcesso;
window.mudarTelaLogin = mudarTelaLogin;
window.trocarIgrejaAdmin = trocarIgrejaAdmin;

// ========================================
// GERENCIAMENTO DE USUÁRIOS (apenas Admin)
// ========================================

let usuarioEditando = null;

// Carregar igrejas no select
function carregarSelectIgrejas() {
    const select = document.getElementById('modal-igreja');
    if (!select) return;
    
    const igrejas = getIgrejas().filter(i => i.ativo);
    
    select.innerHTML = '<option value="">Selecione uma igreja</option>' + 
        igrejas.map(i => `<option value="${i.id}">${i.nome} - ${i.cidade}/${i.uf}</option>`).join('');
}

// Listar usuários
function listarUsuarios() {
    console.log('👥 Iniciando listagem de usuários...');
    
    const usuarios = getUsuarios();
    const igrejas = getIgrejas();
    const container = document.getElementById('lista-usuarios');
    
    console.log('📊 Total de usuários:', usuarios.length);
    console.log('📊 Total de igrejas:', igrejas.length);
    console.log('📦 Container encontrado:', !!container);
    
    if (!container) {
        console.error('❌ Container #lista-usuarios não encontrado!');
        return;
    }
    
    if (usuarios.length === 0) {
        console.log('⚠️ Nenhum usuário cadastrado');
        container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Nenhum usuário cadastrado.</p>';
        return;
    }
    
    const niveis = {
        1: { texto: 'Administrador', classe: 'badge-admin', icone: '👑' },
        2: { texto: 'Diretoria EBD', classe: 'badge-diretoria', icone: '📋' },
        3: { texto: 'Auxiliar', classe: 'badge-auxiliar', icone: '👁️' }
    };
    
    container.innerHTML = usuarios.map(u => {
        const igreja = u.igrejaId ? igrejas.find(i => i.id === u.igrejaId) : null;
        const igrejaTexto = u.nivel === 1 ? 'Todas as Igrejas' : (igreja ? igreja.nome : 'Sem igreja');
        
        return `
        <div class="user-card">
            <div class="user-info-card">
                <div class="user-name">${u.nome}</div>
                <div class="user-details">
                    <span>👤 ${u.usuario}</span>
                    <span>📧 ${u.email}</span>
                    <span>📱 ${u.celular}</span>
                    <span>🏛️ ${igrejaTexto}</span>
                    <span class="user-badge ${niveis[u.nivel].classe}">
                        ${niveis[u.nivel].icone} ${niveis[u.nivel].texto}
                    </span>
                    ${!u.ativo ? '<span class="user-badge" style="background:#fee2e2;color:#991b1b;">🚫 Inativo</span>' : ''}
                </div>
            </div>
            <div class="user-actions">
                <button class="btn-icon" onclick="editarUsuario(${u.id})" title="Editar">✏️</button>
                <button class="btn-icon warning" onclick="resetarSenhaUsuario(${u.id})" title="Resetar Senha">🔑</button>
                <button class="btn-icon ${u.ativo ? 'danger' : 'success'}" onclick="toggleAtivoUsuario(${u.id})" 
                    title="${u.ativo ? 'Desativar' : 'Ativar'}">
                    ${u.ativo ? '🔴' : '🟢'}
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Abrir modal para novo usuário
function abrirModalUsuario() {
    console.log('🔓 Abrindo modal para novo usuário...');
    usuarioEditando = null;
    document.getElementById('modal-usuario-titulo').textContent = '➕ Novo Usuário';
    document.getElementById('modal-nome').value = '';
    document.getElementById('modal-input-usuario').value = '';
    document.getElementById('modal-email').value = '';
    document.getElementById('modal-celular').value = '';
    document.getElementById('modal-nivel').value = '3';
    document.getElementById('modal-senha').value = '';
    document.getElementById('campo-senha').style.display = 'block';
    
    // Carregar igrejas no select
    carregarSelectIgrejas();
    document.getElementById('campo-igreja').style.display = 'block';
    
    const modal = document.getElementById('modal-usuario');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal exibido');
    } else {
        console.error('❌ Modal não encontrado!');
    }
}

// Editar usuário
function editarUsuario(id) {
    console.log('✏️ Editando usuário ID:', id);
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    
    if (!usuario) {
        alert('Usuário não encontrado!');
        console.error('❌ Usuário não encontrado:', id);
        return;
    }
    
    console.log('📋 Dados do usuário:', usuario);
    usuarioEditando = id;
    document.getElementById('modal-usuario-titulo').textContent = '✏️ Editar Usuário';
    document.getElementById('modal-nome').value = usuario.nome;
    document.getElementById('modal-input-usuario').value = usuario.usuario;
    document.getElementById('modal-email').value = usuario.email;
    document.getElementById('modal-celular').value = usuario.celular;
    document.getElementById('modal-nivel').value = usuario.nivel;
    document.getElementById('modal-senha').value = '';
    document.getElementById('campo-senha').style.display = 'none';
    
    // Carregar igrejas e selecionar a do usuário
    carregarSelectIgrejas();
    if (usuario.nivel === 1) {
        document.getElementById('campo-igreja').style.display = 'none';
    } else {
        document.getElementById('campo-igreja').style.display = 'block';
        document.getElementById('modal-igreja').value = usuario.igrejaId || '';
    }
    document.getElementById('modal-input-usuario').value = usuario.usuario;
    document.getElementById('modal-email').value = usuario.email;
    document.getElementById('modal-celular').value = usuario.celular;
    document.getElementById('modal-nivel').value = usuario.nivel;
    document.getElementById('modal-senha').value = '';
    document.getElementById('campo-senha').style.display = 'none';
    
    const modal = document.getElementById('modal-usuario');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal de edição exibido');
    } else {
        console.error('❌ Modal não encontrado!');
    }
}

// Salvar usuário (criar ou editar)
function salvarUsuario() {
    console.log('🔧 Iniciando salvarUsuario...', {editando: usuarioEditando});
    
    const nome = document.getElementById('modal-nome').value.trim();
    const usuario = document.getElementById('modal-input-usuario').value.trim();
    const email = document.getElementById('modal-email').value.trim();
    const celular = document.getElementById('modal-celular').value.trim();
    const nivel = parseInt(document.getElementById('modal-nivel').value);
    const igrejaId = nivel === 1 ? null : parseInt(document.getElementById('modal-igreja').value) || null;
    const senha = document.getElementById('modal-senha').value;
    
    console.log('📝 Dados capturados:', {nome, usuario, email, celular, nivel, igrejaId});
    
    // Validações
    if (!nome || !usuario || !email || !celular) {
        alert('❌ Preencha todos os campos obrigatórios!');
        console.error('❌ Validação falhou: campos vazios');
        return;
    }
    
    if (nivel !== 1 && !igrejaId) {
        alert('❌ Selecione uma igreja para o usuário!');
        console.error('❌ Validação falhou: igreja não selecionada');
        return;
    }
    
    if (!usuarioEditando && (!senha || senha.length < 6)) {
        alert('❌ A senha deve ter pelo menos 6 caracteres!');
        console.error('❌ Validação falhou: senha inválida');
        return;
    }
    
    const usuarios = getUsuarios();
    console.log('👥 Usuários atuais:', usuarios.length);
    
    if (usuarioEditando) {
        // Editar usuário existente
        const index = usuarios.findIndex(u => u.id === usuarioEditando);
        console.log('✏️ Editando usuário ID:', usuarioEditando, 'Index:', index);
        
        if (index !== -1) {
            // Verificar se usuário já existe (exceto o próprio)
            const usuarioExiste = usuarios.find(u => 
                u.usuario.toLowerCase() === usuario.toLowerCase() && 
                u.id !== usuarioEditando
            );
            
            if (usuarioExiste) {
                alert('❌ Nome de usuário já existe!');
                console.error('❌ Usuário duplicado');
                return;
            }
            
            usuarios[index] = {
                ...usuarios[index],
                nome,
                usuario,
                email,
                celular,
                nivel,
                igrejaId
            };
            
            console.log('💾 Salvando usuário editado:', usuarios[index]);
            salvarUsuarios(usuarios);
            alert('✅ Usuário atualizado com sucesso!');
            console.log('✅ Usuário atualizado');
        }
    } else {
        // Criar novo usuário
        const usuarioExiste = usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
        
        if (usuarioExiste) {
            alert('❌ Nome de usuário já existe!');
            console.error('❌ Usuário duplicado');
            return;
        }
        
        const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        
        const novoUsuario = {
            id: novoId,
            usuario,
            senha,
            nome,
            email,
            celular,
            nivel,
            igrejaId,
            ativo: true
        };
        
        console.log('➕ Criando novo usuário:', novoUsuario);
        usuarios.push(novoUsuario);
        salvarUsuarios(usuarios);
        alert('✅ Usuário criado com sucesso!');
        console.log('✅ Novo usuário criado com ID:', novoId);
    }
    
    fecharModalUsuario();
    listarUsuarios();
    console.log('🔄 Lista de usuários atualizada');
}

// Fechar modal
function fecharModalUsuario() {
    document.getElementById('modal-usuario').style.display = 'none';
    usuarioEditando = null;
}

// Resetar senha do usuário
function resetarSenhaUsuario(id) {
    const novaSenha = prompt('🔑 Digite a nova senha (mínimo 6 caracteres):');
    
    if (!novaSenha) return;
    
    if (novaSenha.length < 6) {
        alert('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
        usuarios[index].senha = novaSenha;
        salvarUsuarios(usuarios);
        alert('✅ Senha resetada com sucesso!');
    }
}

// Ativar/Desativar usuário
function toggleAtivoUsuario(id) {
    const usuarioLogado = getUsuarioLogado();
    
    if (usuarioLogado && usuarioLogado.id === id) {
        alert('❌ Você não pode desativar seu próprio usuário!');
        return;
    }
    
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
        usuarios[index].ativo = !usuarios[index].ativo;
        salvarUsuarios(usuarios);
        
        const acao = usuarios[index].ativo ? 'ativado' : 'desativado';
        alert(`✅ Usuário ${acao} com sucesso!`);
        listarUsuarios();
    }
}

// ========================================
// GERENCIAMENTO DE IGREJAS (apenas Admin)
// ========================================

let igrejaEditando = null;

// Listar igrejas
function listarIgrejas() {
    const igrejas = getIgrejas();
    const container = document.getElementById('lista-igrejas');
    
    if (!container) return;
    
    if (igrejas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma igreja cadastrada</p>';
        return;
    }
    
    container.innerHTML = igrejas.map(igreja => `
        <div class="user-info-card" style="border-left: 4px solid ${igreja.ativo ? '#10b981' : '#ef4444'};">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">
                        ${igreja.nome}
                        ${!igreja.ativo ? ' <span style="color: #ef4444; font-size: 0.8rem;">(Inativa)</span>' : ''}
                    </div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        📍 ${igreja.endereco} - ${igreja.cidade}/${igreja.uf}
                    </div>
                    ${igreja.pastor ? `<div style="font-size: 0.85rem; color: #666;">👤 Pastor: ${igreja.pastor}</div>` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-small btn-view" onclick="editarIgreja(${igreja.id})" title="Editar">✏️</button>
                    <button class="btn-small" style="background: ${igreja.ativo ? '#fee2e2' : '#dcfce7'}; color: ${igreja.ativo ? '#dc2626' : '#16a34a'};" 
                        onclick="toggleAtivoIgreja(${igreja.id})" title="${igreja.ativo ? 'Desativar' : 'Ativar'}">
                        ${igreja.ativo ? '🔴' : '🟢'}
                    </button>
                </div>
            </div>
            <div style="font-size: 0.75rem; color: #999; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                👥 ${contarUsuariosPorIgreja(igreja.id)} usuário(s) vinculado(s)
            </div>
        </div>
    `).join('');
}

// Contar usuários por igreja
function contarUsuariosPorIgreja(igrejaId) {
    const usuarios = getUsuarios();
    return usuarios.filter(u => u.igrejaId === igrejaId).length;
}

// Abrir modal para nova igreja
function abrirModalIgreja() {
    console.log('🏛️ Abrindo modal para nova igreja...');
    igrejaEditando = null;
    document.getElementById('modal-igreja-titulo').textContent = '➕ Nova Igreja';
    document.getElementById('modal-igreja-nome').value = '';
    document.getElementById('modal-igreja-endereco').value = '';
    document.getElementById('modal-igreja-cidade').value = '';
    document.getElementById('modal-igreja-uf').value = '';
    document.getElementById('modal-igreja-pastor').value = '';
    
    const modal = document.getElementById('modal-igreja');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal de igreja exibido');
    } else {
        console.error('❌ Modal de igreja não encontrado!');
    }
}

// Editar igreja
function editarIgreja(id) {
    console.log('✏️ Editando igreja ID:', id);
    const igrejas = getIgrejas();
    const igreja = igrejas.find(i => i.id === id);
    
    if (!igreja) {
        alert('Igreja não encontrada!');
        console.error('❌ Igreja não encontrada:', id);
        return;
    }
    
    console.log('📋 Dados da igreja:', igreja);
    igrejaEditando = id;
    document.getElementById('modal-igreja-titulo').textContent = '✏️ Editar Igreja';
    document.getElementById('modal-igreja-nome').value = igreja.nome;
    document.getElementById('modal-igreja-endereco').value = igreja.endereco;
    document.getElementById('modal-igreja-cidade').value = igreja.cidade;
    document.getElementById('modal-igreja-uf').value = igreja.uf;
    document.getElementById('modal-igreja-pastor').value = igreja.pastor || '';
    
    const modal = document.getElementById('modal-igreja');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal de edição de igreja exibido');
    } else {
        console.error('❌ Modal de igreja não encontrado!');
    }
}

// Salvar igreja (criar ou editar)
function salvarIgreja() {
    console.log('🔧 Iniciando salvarIgreja...', {editando: igrejaEditando});
    
    const nome = document.getElementById('modal-igreja-nome').value.trim();
    const endereco = document.getElementById('modal-igreja-endereco').value.trim();
    const cidade = document.getElementById('modal-igreja-cidade').value.trim();
    const uf = document.getElementById('modal-igreja-uf').value.trim();
    const pastor = document.getElementById('modal-igreja-pastor').value.trim();
    
    console.log('📝 Dados capturados:', {nome, endereco, cidade, uf, pastor});
    
    // Validações
    if (!nome || !endereco || !cidade || !uf) {
        alert('❌ Preencha todos os campos obrigatórios!');
        console.error('❌ Validação falhou: campos vazios');
        return;
    }
    
    const igrejas = getIgrejas();
    console.log('🏛️ Igrejas atuais:', igrejas.length);
    
    if (igrejaEditando) {
        // Editar igreja existente
        const index = igrejas.findIndex(i => i.id === igrejaEditando);
        console.log('✏️ Editando igreja ID:', igrejaEditando, 'Index:', index);
        
        if (index !== -1) {
            igrejas[index] = {
                ...igrejas[index],
                nome,
                endereco,
                cidade,
                uf,
                pastor
            };
            
            console.log('💾 Salvando igreja editada:', igrejas[index]);
            salvarIgrejas(igrejas);
            alert('✅ Igreja atualizada com sucesso!');
            console.log('✅ Igreja atualizada');
        }
    } else {
        // Criar nova igreja
        const novoId = igrejas.length > 0 ? Math.max(...igrejas.map(i => i.id)) + 1 : 1;
        
        const novaIgreja = {
            id: novoId,
            nome,
            endereco,
            cidade,
            uf,
            pastor,
            ativo: true
        };
        
        console.log('➕ Criando nova igreja:', novaIgreja);
        igrejas.push(novaIgreja);
        salvarIgrejas(igrejas);
        alert('✅ Igreja criada com sucesso!');
        console.log('✅ Nova igreja criada com ID:', novoId);
    }
    
    fecharModalIgreja();
    listarIgrejas();
    console.log('🔄 Lista de igrejas atualizada');
}

// Fechar modal de igreja
function fecharModalIgreja() {
    document.getElementById('modal-igreja').style.display = 'none';
    igrejaEditando = null;
}

// Ativar/Desativar igreja
function toggleAtivoIgreja(id) {
    const igrejas = getIgrejas();
    const index = igrejas.findIndex(i => i.id === id);
    
    if (index !== -1) {
        const usuariosDaIgreja = contarUsuariosPorIgreja(id);
        
        if (igrejas[index].ativo && usuariosDaIgreja > 0) {
            const confirma = confirm(`Esta igreja possui ${usuariosDaIgreja} usuário(s) vinculado(s).\n\nDeseja realmente desativar?`);
            if (!confirma) return;
        }
        
        igrejas[index].ativo = !igrejas[index].ativo;
        salvarIgrejas(igrejas);
        
        const acao = igrejas[index].ativo ? 'ativada' : 'desativada';
        alert(`✅ Igreja ${acao} com sucesso!`);
        listarIgrejas();
    }
}

// Expor funções de usuários e igrejas globalmente
window.listarUsuarios = listarUsuarios;
window.abrirModalUsuario = abrirModalUsuario;
window.editarUsuario = editarUsuario;
window.salvarUsuario = salvarUsuario;
window.fecharModalUsuario = fecharModalUsuario;
window.resetarSenhaUsuario = resetarSenhaUsuario;
window.toggleAtivoUsuario = toggleAtivoUsuario;
window.listarIgrejas = listarIgrejas;
window.abrirModalIgreja = abrirModalIgreja;
window.editarIgreja = editarIgreja;
window.salvarIgreja = salvarIgreja;
window.fecharModalIgreja = fecharModalIgreja;
window.toggleAtivoIgreja = toggleAtivoIgreja;

