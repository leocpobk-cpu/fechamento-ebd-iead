// Sistema de Autenticação e Controle de Acesso
// Níveis: 1=Admin, 2=Diretoria EBD, 3=Auxiliar

// Contador de tentativas de login
let tentativasLogin = 0;
const MAX_TENTATIVAS = 3;

// Variáveis globais para gerenciamento
let usuarioEditando = null;
let igrejaEditando = null;

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
// Buscar igrejas do Supabase
async function getIgrejas() {
    const sb = getSupabase();
    if (!sb) {
        console.error('❌ Supabase não inicializado');
        return [];
    }
    
    const { data, error } = await sb
        .from('igrejas')
        .select('*')
        .order('nome');
    
    if (error) {
        console.error('❌ Erro ao buscar igrejas:', error);
        return [];
    }
    
    return data || [];
}

// Função legada - não mais necessária (Supabase salva automaticamente)
function salvarIgrejas(igrejas) {
    console.warn('⚠️ salvarIgrejas() não é mais necessário com Supabase');
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
async function getUsuarios() {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('usuarios')
        .select('*')
        .order('nome');
    
    if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return [];
    }
    return data || [];
}

// Salvar usuários (DEPRECATED - Supabase salva automaticamente)
function salvarUsuarios(usuarios) {
    console.warn('⚠️ salvarUsuarios() está deprecated. Use operações diretas no Supabase.');
}

// Obter usuário logado
function getUsuarioLogado() {
    return JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');
}

// Fazer login
async function fazerLogin() {
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
    
    try {
        // Buscar usuário no Supabase
        const sb = getSupabase();
        const { data: usuarios, error } = await sb
            .from('usuarios')
            .select('*')
            .eq('usuario', usuario.toLowerCase())
            .eq('senha', senha)
            .eq('ativo', true)
            .limit(1);
        
        if (error) throw error;
        
        const usuarioEncontrado = usuarios?.[0];
        
        if (usuarioEncontrado) {
            console.log('✅ Usuário encontrado:', usuarioEncontrado.usuario);
            
            // Verificar se é primeiro acesso
            if (usuarioEncontrado.primeiro_acesso) {
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
                igrejaId: usuarioEncontrado.igreja_id,
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
                    `Usuário ou senha inválidos!\nTentativa ${tentativasLogin} de ${MAX_TENTATIVAS} (${restantes} restante${restantes !== 1 ? 's' : ''})`, 
                    'error'
                );
            }
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        
        // Restaurar botão
        if (btnLogin) {
            btnLogin.textContent = 'ENTRAR';
            btnLogin.disabled = false;
        }
        
        mostrarAlertaLogin('Erro ao tentar fazer login. Tente novamente.', 'error');
    }
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
    verificarConviteNaURL(); // Verificar se há convite na URL
    
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

// Carregar igrejas no select
// Carregar igrejas no select (async agora)
async function carregarSelectIgrejas() {
    const select = document.getElementById('modal-select-igreja');
    if (!select) return;
    
    const igrejas = await getIgrejas();
    const igrejasAtivas = igrejas.filter(i => i.ativo);
    
    select.innerHTML = '<option value="">Selecione uma igreja</option>' + 
        igrejasAtivas.map(i => `<option value="${i.id}">${i.nome} - ${i.cidade}/${i.uf}</option>`).join('');
}

// Listar usuários
async function listarUsuarios() {
    console.log('👥 Iniciando listagem de usuários...');
    
    const usuarios = await getUsuarios();
    const igrejas = await getIgrejas();
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
        const igreja = u.igreja_id ? igrejas.find(i => i.id === u.igreja_id) : null;
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
async function editarUsuario(id) {
    console.log('✏️ Editando usuário ID:', id);
    
    const sb = getSupabase();
    const { data: usuarios, error } = await sb
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .limit(1);
    
    if (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        alert('Erro ao carregar usuário!');
        return;
    }
    
    const usuario = usuarios?.[0];
    
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
    await carregarSelectIgrejas();
    if (usuario.nivel === 1) {
        document.getElementById('campo-igreja').style.display = 'none';
    } else {
        document.getElementById('campo-igreja').style.display = 'block';
        document.getElementById('modal-select-igreja').value = usuario.igreja_id || '';
    }
    
    const modal = document.getElementById('modal-usuario');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal de edição exibido');
    } else {
        console.error('❌ Modal não encontrado!');
    }
}

// Salvar usuário (criar ou editar)
async function salvarUsuario() {
    console.log('🔧 Iniciando salvarUsuario...', {editando: usuarioEditando});
    
    const nome = document.getElementById('modal-nome').value.trim();
    const usuario = document.getElementById('modal-input-usuario').value.trim();
    const email = document.getElementById('modal-email').value.trim();
    const celular = document.getElementById('modal-celular').value.trim();
    const nivel = parseInt(document.getElementById('modal-nivel').value);
    const igrejaId = nivel === 1 ? null : parseInt(document.getElementById('modal-select-igreja').value) || null;
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
    
    const sb = getSupabase();
    
    try {
        if (usuarioEditando) {
            // Editar usuário existente
            console.log('✏️ Editando usuário ID:', usuarioEditando);
            
            // Verificar se usuário já existe (exceto o próprio)
            const { data: duplicados, error: errDuplicado } = await sb
                .from('usuarios')
                .select('id')
                .eq('usuario', usuario.toLowerCase())
                .neq('id', usuarioEditando);
            
            if (errDuplicado) throw errDuplicado;
            
            if (duplicados && duplicados.length > 0) {
                alert('❌ Nome de usuário já existe!');
                console.error('❌ Usuário duplicado');
                return;
            }
            
            const { error } = await sb
                .from('usuarios')
                .update({
                    nome,
                    usuario: usuario.toLowerCase(),
                    email,
                    celular,
                    nivel,
                    igreja_id: igrejaId
                })
                .eq('id', usuarioEditando);
            
            if (error) throw error;
            
            console.log('✅ Usuário atualizado');
            alert('✅ Usuário atualizado com sucesso!');
        } else {
            // Criar novo usuário
            console.log('➕ Criando novo usuário');
            
            // Verificar se usuário já existe
            const { data: duplicados, error: errDuplicado } = await sb
                .from('usuarios')
                .select('id')
                .eq('usuario', usuario.toLowerCase());
            
            if (errDuplicado) throw errDuplicado;
            
            if (duplicados && duplicados.length > 0) {
                alert('❌ Nome de usuário já existe!');
                console.error('❌ Usuário duplicado');
                return;
            }
            
            const { error } = await sb
                .from('usuarios')
                .insert([{
                    usuario: usuario.toLowerCase(),
                    senha,
                    nome,
                    email,
                    celular,
                    nivel,
                    igreja_id: igrejaId,
                    ativo: true,
                    primeiro_acesso: true
                }]);
            
            if (error) throw error;
            
            console.log('✅ Novo usuário criado');
            alert('✅ Usuário criado com sucesso!');
        }
        
        fecharModalUsuario();
        await listarUsuarios();
        console.log('🔄 Lista de usuários atualizada');
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error);
        alert('❌ Erro ao salvar usuário. Tente novamente.');
    }
}

// Fechar modal
function fecharModalUsuario() {
    document.getElementById('modal-usuario').style.display = 'none';
    usuarioEditando = null;
}

// Resetar senha do usuário
async function resetarSenhaUsuario(id) {
    const novaSenha = prompt('🔑 Digite a nova senha (mínimo 6 caracteres):');
    
    if (!novaSenha) return;
    
    if (novaSenha.length < 6) {
        alert('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    try {
        const sb = getSupabase();
        const { error } = await sb
            .from('usuarios')
            .update({
                senha: novaSenha,
                primeiro_acesso: true
            })
            .eq('id', id);
        
        if (error) throw error;
        
        alert('✅ Senha resetada com sucesso! Usuário precisará redefinir no próximo login.');
    } catch (error) {
        console.error('❌ Erro ao resetar senha:', error);
        alert('❌ Erro ao resetar senha. Tente novamente.');
    }
}

// Ativar/Desativar usuário
async function toggleAtivoUsuario(id) {
    const usuarioLogado = getUsuarioLogado();
    
    if (usuarioLogado && usuarioLogado.id === id) {
        alert('❌ Você não pode desativar seu próprio usuário!');
        return;
    }
    
    try {
        const sb = getSupabase();
        
        // Buscar estado atual
        const { data: usuarios, error: errBusca } = await sb
            .from('usuarios')
            .select('ativo')
            .eq('id', id)
            .limit(1);
        
        if (errBusca) throw errBusca;
        
        if (!usuarios || usuarios.length === 0) {
            alert('❌ Usuário não encontrado!');
            return;
        }
        
        const novoStatus = !usuarios[0].ativo;
        
        // Atualizar status
        const { error } = await sb
            .from('usuarios')
            .update({ ativo: novoStatus })
            .eq('id', id);
        
        if (error) throw error;
        
        const acao = novoStatus ? 'ativado' : 'desativado';
        alert(`✅ Usuário ${acao} com sucesso!`);
        await listarUsuarios();
    } catch (error) {
        console.error('❌ Erro ao alterar status do usuário:', error);
        alert('❌ Erro ao alterar status. Tente novamente.');
    }
}

// ========================================
// GERENCIAMENTO DE IGREJAS (apenas Admin)
// ========================================

// Listar igrejas
// Listar igrejas (async agora)
async function listarIgrejas() {
    const igrejas = await getIgrejas();
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
                👥 <span id="count-igreja-${igreja.id}">...</span> usuário(s) vinculado(s)
            </div>
        </div>
    `).join('');
    
    // Carregar contagem de usuários async
    igrejas.forEach(igreja => {
        contarUsuariosPorIgreja(igreja.id).then(count => {
            const el = document.getElementById(`count-igreja-${igreja.id}`);
            if (el) el.textContent = count;
        });
    });
}

// Contar usuários por igreja (async agora)
async function contarUsuariosPorIgreja(igrejaId) {
    const sb = getSupabase();
    if (!sb) return 0;
    
    const { count, error } = await sb
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('igreja_id', igrejaId);
    
    if (error) {
        console.error('❌ Erro ao contar usuários:', error);
        return 0;
    }
    
    return count || 0;
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
// Editar igreja (async agora)
async function editarIgreja(id) {
    console.log('✏️ Editando igreja ID:', id);
    const igrejas = await getIgrejas();
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
// Salvar igreja (async agora - insere ou atualiza no Supabase)
async function salvarIgreja() {
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
    
    const sb = getSupabase();
    if (!sb) {
        alert('❌ Erro: Supabase não inicializado');
        return;
    }
    
    if (igrejaEditando) {
        // Editar igreja existente
        console.log('✏️ Editando igreja ID:', igrejaEditando);
        
        const { error } = await sb
            .from('igrejas')
            .update({
                nome,
                endereco,
                cidade,
                uf,
                pastor
            })
            .eq('id', igrejaEditando);
        
        if (error) {
            console.error('❌ Erro ao atualizar igreja:', error);
            alert('❌ Erro ao atualizar igreja: ' + error.message);
            return;
        }
        
        alert('✅ Igreja atualizada com sucesso!');
        console.log('✅ Igreja atualizada');
    } else {
        // Criar nova igreja
        console.log('➕ Criando nova igreja');
        
        const { data, error } = await sb
            .from('igrejas')
            .insert([{
                nome,
                endereco,
                cidade,
                uf,
                pastor,
                ativo: true
            }])
            .select();
        
        if (error) {
            console.error('❌ Erro ao criar igreja:', error);
            alert('❌ Erro ao criar igreja: ' + error.message);
            return;
        }
        
        alert('✅ Igreja criada com sucesso!');
        console.log('✅ Nova igreja criada:', data);
    }
    
    fecharModalIgreja();
    await listarIgrejas();
    console.log('🔄 Lista de igrejas atualizada');
}

// Fechar modal de igreja
function fecharModalIgreja() {
    document.getElementById('modal-igreja').style.display = 'none';
    igrejaEditando = null;
}

// Ativar/Desativar igreja (async agora)
async function toggleAtivoIgreja(id) {
    const igrejas = await getIgrejas();
    const igreja = igrejas.find(i => i.id === id);
    
    if (!igreja) {
        alert('❌ Igreja não encontrada');
        return;
    }
    
    const usuariosDaIgreja = await contarUsuariosPorIgreja(id);
    
    if (igreja.ativo && usuariosDaIgreja > 0) {
        const confirma = confirm(`Esta igreja possui ${usuariosDaIgreja} usuário(s) vinculado(s).\n\nDeseja realmente desativar?`);
        if (!confirma) return;
    }
    
    const sb = getSupabase();
    if (!sb) {
        alert('❌ Erro: Supabase não inicializado');
        return;
    }
    
    const novoStatus = !igreja.ativo;
    
    const { error } = await sb
        .from('igrejas')
        .update({ ativo: novoStatus })
        .eq('id', id);
    
    if (error) {
        console.error('❌ Erro ao alterar status da igreja:', error);
        alert('❌ Erro ao alterar status: ' + error.message);
        return;
    }
    
    const acao = novoStatus ? 'ativada' : 'desativada';
    alert(`✅ Igreja ${acao} com sucesso!`);
    await listarIgrejas();
}

// ========================================
// SISTEMA DE CONVITE VIA WHATSAPP
// ========================================

// Abrir modal de convite
function abrirModalConvite() {
    console.log('📱 Abrindo modal de convite...');
    
    // Limpar campos
    document.getElementById('convite-nome').value = '';
    document.getElementById('convite-nivel').value = '2';
    document.getElementById('convite-validade').value = '72';
    
    // Carregar igrejas
    const selectIgreja = document.getElementById('convite-igreja');
    const igrejas = getIgrejas().filter(i => i.ativo);
    selectIgreja.innerHTML = '<option value="">Selecione uma igreja</option>' +
        igrejas.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');
    
    const modal = document.getElementById('modal-convite');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal de convite exibido');
    }
}

// Fechar modal de convite
function fecharModalConvite() {
    document.getElementById('modal-convite').style.display = 'none';
}

// Gerar link de convite
async function gerarLinkConvite() {
    const nome = document.getElementById('convite-nome').value.trim();
    const nivel = document.getElementById('convite-nivel').value;
    const igrejaId = document.getElementById('convite-igreja').value;
    const validade = document.getElementById('convite-validade').value;
    
    if (!igrejaId) {
        alert('⚠️ Por favor, selecione uma igreja!');
        return;
    }
    
    try {
        const sb = getSupabase();
        const usuarioLogado = getUsuarioLogado();
        
        // Criar token de convite
        const conviteId = Date.now().toString();
        const expiraEm = new Date(Date.now() + (parseInt(validade) * 60 * 60 * 1000)).toISOString();
        
        // Salvar convite no Supabase
        const { error } = await sb
            .from('convites')
            .insert([{
                id: conviteId,
                nivel: parseInt(nivel),
                igreja_id: parseInt(igrejaId),
                expira_em: expiraEm,
                usado: false,
                criado_por: usuarioLogado.id
            }]);
        
        if (error) throw error;
        
        // Obter nome da igreja
        const igrejas = await getIgrejas();
        const igreja = igrejas.find(i => i.id == igrejaId);
        const nomeIgreja = igreja ? igreja.nome : '';
        
        // Codificar dados do convite na URL (funciona entre dispositivos)
        const dadosConvite = btoa(JSON.stringify({
            id: conviteId,
            igrejaId: parseInt(igrejaId),
            igrejaName: nomeIgreja,
            nivel: parseInt(nivel),
            expiraEm: expiraEm
        }));
        
        const baseUrl = window.location.origin + window.location.pathname;
        const linkConvite = `${baseUrl}?convite=${dadosConvite}`;
        
        // Criar mensagem WhatsApp
        const nivelTexto = nivel == '2' ? 'Editor (Diretoria EBD)' : 'Visualizador (Auxiliar)';
        
        let mensagem = `🎉 *Convite - Sistema EBD IEAD*\n\n`;
        if (nome) {
            mensagem += `Olá *${nome}*! `;
        }
        mensagem += `Você foi convidado(a) para fazer parte da equipe da *${nomeIgreja}*!\n\n`;
        mensagem += `📋 *Nível de Acesso:* ${nivelTexto}\n`;
        mensagem += `⏰ *Validade:* ${validade} horas\n\n`;
        mensagem += `👉 *Clique no link abaixo para criar sua conta:*\n`;
        mensagem += `${linkConvite}\n\n`;
        mensagem += `_Este link expira em ${validade}h ou após ser usado._`;
        
        // Abrir WhatsApp
        const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsApp, '_blank');
        
        alert('✅ Link de convite gerado!\n\nO WhatsApp será aberto para você enviar o convite.');
        fecharModalConvite();
    } catch (error) {
        console.error('❌ Erro ao gerar convite:', error);
        alert('❌ Erro ao gerar convite. Tente novamente.');
    }
}

// Verificar se há convite na URL
function verificarConviteNaURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const conviteId = urlParams.get('convite');
    
    if (conviteId) {
        console.log('🎁 Convite detectado na URL:', conviteId);
        processarConvite(conviteId);
    }
}

// Processar convite
async function processarConvite(conviteId) {
    try {
        // Decodificar dados do convite da URL
        const dadosConvite = JSON.parse(atob(conviteId));
        
        // Verificar validade
        const agora = new Date();
        const expira = new Date(dadosConvite.expiraEm);
        
        if (agora > expira) {
            alert('❌ Este convite expirou!');
            return;
        }
        
        // Verificar no Supabase se já foi usado
        const sb = getSupabase();
        const { data: convites, error } = await sb
            .from('convites')
            .select('usado')
            .eq('id', dadosConvite.id)
            .limit(1);
        
        if (error) throw error;
        
        if (convites && convites.length > 0 && convites[0].usado) {
            alert('❌ Este convite já foi utilizado!');
            return;
        }
        
        // Salvar dados do convite para uso no cadastro
        sessionStorage.setItem('conviteAtivo', JSON.stringify(dadosConvite));
        
        // Mostrar tela de cadastro via convite
        mostrarTelaCadastroConvite(dadosConvite);
        
    } catch (error) {
        console.error('Erro ao processar convite:', error);
        alert('❌ Convite inválido ou corrompido!');
    }
}

// Mostrar tela de cadastro via convite
function mostrarTelaCadastroConvite(convite) {
    // Usar nome da igreja do convite (já vem nos dados)
    const nomeIgreja = convite.igrejaName || convite.igrejaId;
    const nivelTexto = convite.nivel == 2 ? 'Diretoria EBD (Editor)' : 'Auxiliar (Visualizador)';
    
    document.getElementById('form-login').style.display = 'none';
    
    // Criar formulário de cadastro se não existir
    let formCadastro = document.getElementById('form-cadastro-convite');
    if (!formCadastro) {
        formCadastro = document.createElement('div');
        formCadastro.id = 'form-cadastro-convite';
        formCadastro.className = 'login-form';
        formCadastro.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; padding: 15px; background: #d1fae5; border-radius: 8px; border-left: 4px solid #10b981;">
                <div style="font-size: 2rem; margin-bottom: 10px;">🎉</div>
                <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 1.1rem;">Bem-vindo(a)!</h3>
                <p style="margin: 0; color: #047857; font-size: 0.9rem;">
                    Você foi convidado para: <strong>${nomeIgreja}</strong><br>
                    <span style="font-size: 0.8rem;">Nível de acesso: ${nivelTexto}</span>
                </p>
            </div>
            
            <div class="form-group">
                <label>👤 Nome Completo</label>
                <input type="text" id="cadastro-nome" placeholder="Digite seu nome completo">
            </div>
            
            <div class="form-group">
                <label>🔑 Nome de Usuário</label>
                <input type="text" id="cadastro-usuario" placeholder="Escolha um nome de usuário">
            </div>
            
            <div class="form-group">
                <label>📧 Email</label>
                <input type="email" id="cadastro-email" placeholder="seu@email.com">
            </div>
            
            <div class="form-group">
                <label>📱 Celular</label>
                <input type="tel" id="cadastro-celular" placeholder="(00) 00000-0000">
            </div>
            
            <div class="form-group">
                <label>🔒 Senha</label>
                <input type="password" id="cadastro-senha" placeholder="Mínimo 6 caracteres">
            </div>
            
            <div class="form-group">
                <label>🔒 Confirmar Senha</label>
                <input type="password" id="cadastro-confirma" placeholder="Digite a senha novamente">
            </div>
            
            <button onclick="finalizarCadastroConvite()" class="btn-login">✅ CRIAR MINHA CONTA</button>
            <button onclick="cancelarCadastroConvite()" class="btn-link">Cancelar</button>
        `;
        document.querySelector('.login-container').appendChild(formCadastro);
    }
    
    formCadastro.style.display = 'block';
}

// Finalizar cadastro via convite
async function finalizarCadastroConvite() {
    const nome = document.getElementById('cadastro-nome').value.trim();
    const usuario = document.getElementById('cadastro-usuario').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const celular = document.getElementById('cadastro-celular').value.trim();
    const senha = document.getElementById('cadastro-senha').value;
    const confirma = document.getElementById('cadastro-confirma').value;
    
    if (!nome || !usuario || !email || !celular || !senha || !confirma) {
        alert('⚠️ Por favor, preencha todos os campos!');
        return;
    }
    
    if (senha.length < 6) {
        alert('⚠️ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    if (senha !== confirma) {
        alert('⚠️ As senhas não coincidem!');
        return;
    }
    
    // Obter dados do convite
    const convite = JSON.parse(sessionStorage.getItem('conviteAtivo'));
    if (!convite) {
        alert('❌ Erro: Convite não encontrado!');
        return;
    }
    
    try {
        const sb = getSupabase();
        
        // Verificar se usuário já existe
        const { data: usuariosExistentes, error: errCheck } = await sb
            .from('usuarios')
            .select('id')
            .eq('usuario', usuario.toLowerCase())
            .limit(1);
        
        if (errCheck) throw errCheck;
        
        if (usuariosExistentes && usuariosExistentes.length > 0) {
            alert('⚠️ Este nome de usuário já está em uso!');
            return;
        }
        
        // Criar novo usuário
        const { data: novoUsuario, error: errInsert } = await sb
            .from('usuarios')
            .insert([{
                usuario: usuario.toLowerCase(),
                senha,
                nome,
                email,
                celular,
                nivel: convite.nivel,
                igreja_id: convite.igrejaId,
                ativo: true,
                primeiro_acesso: false,
                criado_via_convite: true
            }])
            .select();
        
        if (errInsert) throw errInsert;
        
        // Marcar convite como usado no Supabase
        const { error: errUpdate } = await sb
            .from('convites')
            .update({
                usado: true,
                usado_em: new Date().toISOString(),
                usuario_criado_id: novoUsuario[0].id
            })
            .eq('id', convite.id);
        
        if (errUpdate) throw errUpdate;
        
        // Limpar convite da sessão
        sessionStorage.removeItem('conviteAtivo');
        
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        alert('✅ Conta criada com sucesso!\n\nFaça login com suas credenciais.');
        
        // Voltar para tela de login
        cancelarCadastroConvite();
    } catch (error) {
        console.error('❌ Erro ao criar conta via convite:', error);
        alert('❌ Erro ao criar conta. Tente novamente.');
    }
}

// Cancelar cadastro via convite
function cancelarCadastroConvite() {
    document.getElementById('form-cadastro-convite').style.display = 'none';
    document.getElementById('form-login').style.display = 'block';
    sessionStorage.removeItem('conviteAtivo');
    
    // Limpar URL
    window.history.replaceState({}, document.title, window.location.pathname);
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
window.abrirModalConvite = abrirModalConvite;
window.fecharModalConvite = fecharModalConvite;
window.gerarLinkConvite = gerarLinkConvite;
window.finalizarCadastroConvite = finalizarCadastroConvite;
window.cancelarCadastroConvite = cancelarCadastroConvite;

console.log('✅ auth.js carregado - Funções exportadas:', {
    abrirModalUsuario: typeof window.abrirModalUsuario,
    abrirModalIgreja: typeof window.abrirModalIgreja,
    abrirModalConvite: typeof window.abrirModalConvite
});
