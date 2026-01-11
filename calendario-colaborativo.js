// Estado da aplicação
let estadoApp = {
    conviteId: null,
    participanteId: null,
    participanteNome: '',
    mesAtual: new Date().getMonth(),
    anoAtual: new Date().getFullYear(),
    eventos: [],
    tiposEvento: []
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
});

// Verificar se já existe uma sessão
function verificarSessao() {
    const sessao = localStorage.getItem('calendario_sessao');
    if (sessao) {
        const dados = JSON.parse(sessao);
        estadoApp.conviteId = dados.conviteId;
        estadoApp.participanteId = dados.participanteId;
        estadoApp.participanteNome = dados.participanteNome;
        mostrarCalendario();
    }
}

// Salvar sessão
function salvarSessao() {
    localStorage.setItem('calendario_sessao', JSON.stringify({
        conviteId: estadoApp.conviteId,
        participanteId: estadoApp.participanteId,
        participanteNome: estadoApp.participanteNome
    }));
}

// Entrar com convite
async function entrarComConvite() {
    const codigo = document.getElementById('codigoConvite').value.trim();
    const nome = document.getElementById('nomeParticipante').value.trim();
    const email = document.getElementById('emailParticipante').value.trim();

    if (!codigo || !nome) {
        alert('Por favor, preencha o código do convite e seu nome');
        return;
    }

    try {
        // Buscar convite
        const { data: convite, error: erroConvite } = await supabase
            .from('calendario_convites')
            .select('*')
            .eq('codigo', codigo)
            .eq('ativo', true)
            .single();

        if (erroConvite || !convite) {
            alert('Código de convite inválido ou expirado');
            return;
        }

        // Verificar se já é participante
        const { data: participanteExistente } = await supabase
            .from('calendario_participantes')
            .select('*')
            .eq('convite_id', convite.id)
            .eq('nome', nome)
            .maybeSingle();

        let participante;
        if (participanteExistente) {
            participante = participanteExistente;
        } else {
            // Criar novo participante
            const { data: novoParticipante, error: erroParticipante } = await supabase
                .from('calendario_participantes')
                .insert({
                    convite_id: convite.id,
                    nome: nome,
                    email: email || null
                })
                .select()
                .single();

            if (erroParticipante) {
                console.error('Erro ao criar participante:', erroParticipante);
                alert('Erro ao entrar no calendário');
                return;
            }
            participante = novoParticipante;
        }

        estadoApp.conviteId = convite.id;
        estadoApp.participanteId = participante.id;
        estadoApp.participanteNome = participante.nome;
        salvarSessao();
        mostrarCalendario();
    } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao processar entrada');
    }
}

// Criar novo calendário
async function criarNovoCalendario() {
    const nomeCalendario = document.getElementById('nomeCalendario').value.trim();
    const nomeCriador = document.getElementById('nomeCriador').value.trim();

    if (!nomeCalendario || !nomeCriador) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Gerar código único
        const codigo = gerarCodigoConvite();

        // Criar convite
        const { data: convite, error: erroConvite } = await supabase
            .from('calendario_convites')
            .insert({
                codigo: codigo,
                nome_calendario: nomeCalendario,
                ativo: true
            })
            .select()
            .single();

        if (erroConvite) {
            console.error('Erro ao criar convite:', erroConvite);
            alert('Erro ao criar calendário');
            return;
        }

        // Criar participante criador
        const { data: participante, error: erroParticipante } = await supabase
            .from('calendario_participantes')
            .insert({
                convite_id: convite.id,
                nome: nomeCriador,
                pode_editar: true
            })
            .select()
            .single();

        if (erroParticipante) {
            console.error('Erro ao criar participante:', erroParticipante);
            alert('Erro ao criar calendário');
            return;
        }

        estadoApp.conviteId = convite.id;
        estadoApp.participanteId = participante.id;
        estadoApp.participanteNome = participante.nome;
        salvarSessao();
        
        alert(`Calendário criado! Código de convite: ${codigo}`);
        mostrarCalendario();
    } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao criar calendário');
    }
}

// Gerar código de convite único
function gerarCodigoConvite() {
    return 'CAL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Mostrar formulário de criar calendário
function mostrarCriarCalendario() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('criarForm').style.display = 'block';
}

// Voltar para login
function voltarLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('criarForm').style.display = 'none';
}

// Mostrar calendário
async function mostrarCalendario() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('participanteNome').textContent = `Olá, ${estadoApp.participanteNome}!`;

    // Carregar dados do convite
    const { data: convite } = await supabase
        .from('calendario_convites')
        .select('*')
        .eq('id', estadoApp.conviteId)
        .single();

    if (convite) {
        document.getElementById('nomeCalendarioAtual').textContent = convite.nome_calendario;
    }

    await carregarTiposEvento();
    await carregarEventos();
    renderizarCalendario();
}

// Carregar tipos de evento
async function carregarTiposEvento() {
    const { data, error } = await supabase
        .from('calendario_tipos_evento')
        .select('*')
        .or(`padrao.eq.true,convite_id.eq.${estadoApp.conviteId}`)
        .order('nome');

    if (!error && data) {
        estadoApp.tiposEvento = data;
        renderizarTiposEvento();
        preencherSelectTipos();
    }
}

// Renderizar tipos de evento
function renderizarTiposEvento() {
    const container = document.getElementById('tiposEventoList');
    container.innerHTML = estadoApp.tiposEvento.map(tipo => `
        <div class="tipo-badge" style="background: ${tipo.cor}">
            ${tipo.icone} ${tipo.nome}
        </div>
    `).join('');
}

// Preencher select de tipos
function preencherSelectTipos() {
    const select = document.getElementById('eventoTipo');
    select.innerHTML = estadoApp.tiposEvento.map(tipo => `
        <option value="${tipo.id}">${tipo.icone} ${tipo.nome}</option>
    `).join('');
}

// Carregar eventos
async function carregarEventos() {
    const primeiroDia = new Date(estadoApp.anoAtual, estadoApp.mesAtual, 1);
    const ultimoDia = new Date(estadoApp.anoAtual, estadoApp.mesAtual + 1, 0);

    const { data, error } = await supabase
        .from('calendario_eventos')
        .select(`
            *,
            tipo_evento:calendario_tipos_evento(*)
        `)
        .eq('convite_id', estadoApp.conviteId)
        .gte('data_evento', primeiroDia.toISOString().split('T')[0])
        .lte('data_evento', ultimoDia.toISOString().split('T')[0])
        .order('data_evento');

    if (!error && data) {
        estadoApp.eventos = data;
    }
}

// Renderizar calendário
function renderizarCalendario() {
    const grid = document.getElementById('calendarGrid');
    const mesAno = document.getElementById('mesAnoAtual');

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    mesAno.textContent = `${meses[estadoApp.mesAtual]} ${estadoApp.anoAtual}`;

    // Cabeçalhos dos dias
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let html = diasSemana.map(dia => 
        `<div class="calendar-header">${dia}</div>`
    ).join('');

    // Calcular primeiro e último dia
    const primeiroDia = new Date(estadoApp.anoAtual, estadoApp.mesAtual, 1);
    const ultimoDia = new Date(estadoApp.anoAtual, estadoApp.mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    // Dias do mês anterior
    const mesAnterior = new Date(estadoApp.anoAtual, estadoApp.mesAtual, 0);
    const diasMesAnterior = mesAnterior.getDate();
    
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">
            <div class="day-number">${diasMesAnterior - i}</div>
        </div>`;
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtual = new Date(estadoApp.anoAtual, estadoApp.mesAtual, dia);
        const dataStr = dataAtual.toISOString().split('T')[0];
        const eventosNoDia = estadoApp.eventos.filter(e => e.data_evento === dataStr);

        html += `<div class="calendar-day" onclick="mostrarModalEvento('${dataStr}')">
            <div class="day-number">${dia}</div>
            ${eventosNoDia.map(evento => `
                <div class="event-badge" style="background: ${evento.tipo_evento.cor}">
                    ${evento.tipo_evento.icone} ${evento.titulo}
                </div>
            `).join('')}
        </div>`;
    }

    // Completar com dias do próximo mês
    const totalCelulas = Math.ceil((diaSemanaInicio + diasNoMes) / 7) * 7;
    const diasProximoMes = totalCelulas - (diaSemanaInicio + diasNoMes);
    
    for (let dia = 1; dia <= diasProximoMes; dia++) {
        html += `<div class="calendar-day other-month">
            <div class="day-number">${dia}</div>
        </div>`;
    }

    grid.innerHTML = html;
}

// Navegação do calendário
function mesAnterior() {
    estadoApp.mesAtual--;
    if (estadoApp.mesAtual < 0) {
        estadoApp.mesAtual = 11;
        estadoApp.anoAtual--;
    }
    carregarEventos().then(() => renderizarCalendario());
}

function proximoMes() {
    estadoApp.mesAtual++;
    if (estadoApp.mesAtual > 11) {
        estadoApp.mesAtual = 0;
        estadoApp.anoAtual++;
    }
    carregarEventos().then(() => renderizarCalendario());
}

function irHoje() {
    const hoje = new Date();
    estadoApp.mesAtual = hoje.getMonth();
    estadoApp.anoAtual = hoje.getFullYear();
    carregarEventos().then(() => renderizarCalendario());
}

// Mostrar modal de evento
function mostrarModalEvento(data = null) {
    const modal = document.getElementById('modalEvento');
    modal.classList.add('active');
    
    if (data) {
        document.getElementById('eventoData').value = data;
    } else {
        document.getElementById('eventoData').value = '';
    }
    
    // Limpar formulário
    document.getElementById('eventoTitulo').value = '';
    document.getElementById('eventoHoraInicio').value = '';
    document.getElementById('eventoHoraFim').value = '';
    document.getElementById('eventoLocal').value = '';
    document.getElementById('eventoDescricao').value = '';
}

// Salvar evento
async function salvarEvento(event) {
    event.preventDefault();

    const dados = {
        convite_id: estadoApp.conviteId,
        tipo_evento_id: document.getElementById('eventoTipo').value,
        titulo: document.getElementById('eventoTitulo').value,
        data_evento: document.getElementById('eventoData').value,
        hora_inicio: document.getElementById('eventoHoraInicio').value || null,
        hora_fim: document.getElementById('eventoHoraFim').value || null,
        local: document.getElementById('eventoLocal').value || null,
        descricao: document.getElementById('eventoDescricao').value || null,
        criado_por: estadoApp.participanteId
    };

    const { error } = await supabase
        .from('calendario_eventos')
        .insert(dados);

    if (error) {
        console.error('Erro ao salvar evento:', error);
        alert('Erro ao salvar evento');
        return;
    }

    fecharModal('modalEvento');
    await carregarEventos();
    renderizarCalendario();
    alert('Evento salvo com sucesso!');
}

// Mostrar link de convite
async function mostrarLinkConvite() {
    const { data: convite } = await supabase
        .from('calendario_convites')
        .select('codigo')
        .eq('id', estadoApp.conviteId)
        .single();

    if (convite) {
        const link = `${window.location.origin}${window.location.pathname}?convite=${convite.codigo}`;
        document.getElementById('linkConvite').value = link;
        document.getElementById('modalConvite').classList.add('active');
    }
}

// Copiar link
function copiarLink() {
    const input = document.getElementById('linkConvite');
    input.select();
    document.execCommand('copy');
    alert('Link copiado!');
}

// Fechar modal
function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Sair
function sair() {
    if (confirm('Deseja sair do calendário?')) {
        localStorage.removeItem('calendario_sessao');
        location.reload();
    }
}

// Verificar parâmetro de convite na URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoConvite = urlParams.get('convite');
    if (codigoConvite) {
        document.getElementById('codigoConvite').value = codigoConvite;
    }
});
