// Sistema de Autenticação e Controle de Acesso
// Níveis: 1=Admin, 2=Diretoria EBD, 3=Auxiliar

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
        ativo: true
    },
    {
        id: 2,
        usuario: 'diretoria',
        senha: 'dir123',
        nome: 'Diretoria EBD',
        email: 'diretoria@iead.com',
        celular: '(11) 98888-8888',
        nivel: 2, // Diretoria - lançamento e visualização
        ativo: true
    },
    {
        id: 3,
        usuario: 'auxiliar',
        senha: 'aux123',
        nome: 'Auxiliar',
        email: 'auxiliar@iead.com',
        celular: '(11) 97777-7777',
        nivel: 3, // Auxiliar - apenas visualização
        ativo: true
    }
];

// Inicializar usuários no localStorage
function inicializarUsuarios() {
    if (!localStorage.getItem('usuariosEBD')) {
        localStorage.setItem('usuariosEBD', JSON.stringify(usuariosPadrao));
    }
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
    
    if (!usuario || !senha) {
        mostrarAlertaLogin('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    const usuarios = getUsuarios();
    const usuarioEncontrado = usuarios.find(u => 
        u.usuario.toLowerCase() === usuario.toLowerCase() && 
        u.senha === senha &&
        u.ativo
    );
    
    if (usuarioEncontrado) {
        // Salvar sessão
        const sessao = {
            id: usuarioEncontrado.id,
            usuario: usuarioEncontrado.usuario,
            nome: usuarioEncontrado.nome,
            nivel: usuarioEncontrado.nivel,
            loginEm: new Date().toISOString()
        };
        sessionStorage.setItem('usuarioLogado', JSON.stringify(sessao));
        
        // Esconder login e mostrar sistema
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('sistema-principal').style.display = 'block';
        
        // Atualizar header com info do usuário
        atualizarHeaderUsuario(sessao);
        
        // Aplicar permissões
        aplicarPermissoes(sessao.nivel);
        
        mostrarAlertaLogin('Login realizado com sucesso!', 'success');
    } else {
        mostrarAlertaLogin('Usuário ou senha inválidos!', 'error');
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
        
    } else if (nivel === 1) {
        // Admin: acesso total
        // Adicionar aba de Usuários
        adicionarAbaUsuarios();
    }
}

// Adicionar aba de gerenciamento de usuários (apenas Admin)
function adicionarAbaUsuarios() {
    const navTabs = document.querySelector('.nav-tabs');
    const abaUsuarios = document.createElement('div');
    abaUsuarios.className = 'nav-tab';
    abaUsuarios.textContent = '👥 Usuários';
    abaUsuarios.onclick = () => mudarTela('usuarios');
    navTabs.appendChild(abaUsuarios);
}

// Mostrar tela de recuperação de senha
function mostrarRecuperacao() {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-recuperacao').style.display = 'block';
}

// Voltar ao login
function voltarLogin() {
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('form-recuperacao').style.display = 'none';
    document.getElementById('form-codigo').style.display = 'none';
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
    } else {
        document.getElementById('tela-login').style.display = 'flex';
        document.getElementById('sistema-principal').style.display = 'none';
    }
}

// Adicionar event listeners para Enter nos inputs
document.addEventListener('DOMContentLoaded', () => {
    inicializarUsuarios();
    verificarAutenticacao();
    
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
});
