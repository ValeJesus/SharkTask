// ============================================================================
// SharkTask - script.js
// Conecta a interface (HTML) com a API REST do back-end Spring Boot.
// Comentários explicam o "porquê" de cada parte, não só o "o quê".
// ============================================================================

// URL base da API. Se você mudar a porta do Spring Boot (server.port no
// application.properties), precisa atualizar aqui também.
const API_URL = 'http://localhost:8080/api/tarefas';

// "Dicionários" (objetos JS usados como mapa chave -> valor) que traduzem
// os valores técnicos do enum (que vêm em MAIÚSCULO do Java) para o texto
// e a classe CSS que aparecem na tela. Centralizar isso aqui evita
// espalhar "if status === 'ATIVO'" por todo o código.
const STATUS_INFO = {
    ATIVO: { texto: 'Ativo', classe: 'etiqueta--azul' },
    PENDENTE: { texto: 'Pendente', classe: 'etiqueta--laranja' },
    CONCLUIDO: { texto: 'Concluído', classe: 'etiqueta--verde' },
};

const PRIORIDADE_INFO = {
    BAIXA: { texto: 'Baixa', classe: 'etiqueta--roxa' },
    MEDIA: { texto: 'Média', classe: 'etiqueta--roxa' },
    ALTA: { texto: 'Alta', classe: 'etiqueta--roxa' },
    URGENTE: { texto: 'Urgente', classe: 'etiqueta--vermelha' },
};

// Guarda em memória a última lista de tarefas que veio da API. Mantemos
// essa cópia local pra poder filtrar (busca + selects) instantaneamente,
// sem precisar fazer uma nova requisição ao servidor a cada letra digitada.
let tarefasCarregadas = [];

// ---- Referências aos elementos do HTML ----
// document.getElementById busca um elemento pelo atributo id="...".
// Guardamos todos numa só vez no topo do arquivo: deixa claro, logo de
// cara, com quais partes da página este script conversa.
const listaTarefasEl = document.getElementById('lista-tarefas');
const mensagemVaziaEl = document.getElementById('mensagem-vazia');

const totalTarefasEl = document.getElementById('total-tarefas');
const totalAtivosEl = document.getElementById('total-ativos');
const totalPendentesEl = document.getElementById('total-pendentes');
const totalConcluidosEl = document.getElementById('total-concluidos');

const campoBuscaEl = document.getElementById('campo-busca');
const filtroStatusEl = document.getElementById('filtro-status');
const filtroCategoriaEl = document.getElementById('filtro-categoria');

const botaoNovoItemEl = document.getElementById('botao-novo-item');
const modalEl = document.getElementById('modal-tarefa');
const formTarefaEl = document.getElementById('form-tarefa');
const modalTituloEl = document.getElementById('modal-titulo');
const modalErroEl = document.getElementById('modal-erro');
const botaoCancelarEl = document.getElementById('botao-cancelar');

const campoIdEl = document.getElementById('campo-id');
const campoTituloEl = document.getElementById('campo-titulo');
const campoDescricaoEl = document.getElementById('campo-descricao');
const campoStatusEl = document.getElementById('campo-status');
const campoPrioridadeEl = document.getElementById('campo-prioridade');
const campoCategoriaEl = document.getElementById('campo-categoria');


// ============================================================================
// LEITURA (GET) - carregar e exibir as tarefas
// ============================================================================

// "async function" marca essa função como assíncrona: por dentro dela
// podemos usar "await" para esperar operações demoradas (como uma
// requisição de rede) sem travar o resto da página.
async function carregarTarefas() {
    try {
        // fetch() dispara a requisição HTTP. Por padrão já é um GET,
        // então não precisamos especificar o método aqui.
        const resposta = await fetch(API_URL);

        // fetch só lança erro em problemas de REDE (sem internet, servidor
        // fora do ar). Um 404 ou 500 ainda chega aqui como "sucesso" do
        // ponto de vista do fetch — por isso conferimos resposta.ok
        // manualmente.
        if (!resposta.ok) {
            throw new Error('Não foi possível carregar as tarefas');
        }

        // .json() lê o corpo da resposta e converte de texto JSON pra
        // um array de objetos JavaScript. Também é assíncrono (precisa
        // ler o corpo da resposta inteiro primeiro), por isso o await.
        tarefasCarregadas = await resposta.json();

        renderizarTarefas();
    } catch (erro) {
        console.error(erro);
        listaTarefasEl.innerHTML = `
            <p class="mensagem-vazia">
                Não foi possível conectar com o servidor. Verifique se o
                back-end Spring Boot está rodando em ${API_URL}.
            </p>
        `;
    }
}

// Aplica os filtros (busca + selects) sobre a lista em memória e
// redesenha a tela. É chamada toda vez que algo muda: depois de
// carregar da API, depois de criar/editar/excluir, ou quando a pessoa
// digita na busca / muda um filtro.
function renderizarTarefas() {
    const termoBusca = campoBuscaEl.value.trim().toLowerCase();
    const statusFiltro = filtroStatusEl.value;
    const categoriaFiltro = filtroCategoriaEl.value;

    // Array.filter cria um NOVO array só com os itens que passam no
    // teste da função. O array original (tarefasCarregadas) não é
    // alterado — isso é importante, porque senão perderíamos os dados
    // completos toda vez que um filtro reduzisse a lista.
    const tarefasFiltradas = tarefasCarregadas.filter((tarefa) => {
        const bateBusca =
            termoBusca === '' ||
            tarefa.titulo.toLowerCase().includes(termoBusca) ||
            (tarefa.descricao ?? '').toLowerCase().includes(termoBusca);

        const bateStatus = statusFiltro === '' || tarefa.status === statusFiltro;
        const bateCategoria = categoriaFiltro === '' || tarefa.categoria === categoriaFiltro;

        return bateBusca && bateStatus && bateCategoria;
    });

    if (tarefasFiltradas.length === 0) {
        listaTarefasEl.innerHTML = '';
        mensagemVaziaEl.hidden = false;
    } else {
        mensagemVaziaEl.hidden = true;
        // .map transforma cada tarefa em um pedaço de HTML (string), e
        // .join('') cola tudo numa string só, sem separador entre os
        // pedaços.
        listaTarefasEl.innerHTML = tarefasFiltradas.map(criarHtmlDoCard).join('');
    }

    // As estatísticas (Total/Ativos/Pendentes/Concluídos) sempre refletem
    // TODAS as tarefas, não só as filtradas — assim a pessoa não acha que
    // perdeu tarefas só porque está com um filtro aplicado.
    atualizarEstatisticas(tarefasCarregadas);
}

// Recebe um objeto "tarefa" (como vem da API) e devolve o HTML do card
// correspondente, já com os botões de ação. Usamos "template literals"
// (crase + ${...}) pra montar HTML com variáveis dentro, de forma legível.
function criarHtmlDoCard(tarefa) {
    const status = STATUS_INFO[tarefa.status] ?? { texto: tarefa.status, classe: '' };
    const prioridade = PRIORIDADE_INFO[tarefa.prioridade] ?? { texto: tarefa.prioridade, classe: '' };

    // escapaHtml evita que um título/descrição contendo "<script>" ou
    // similar seja interpretado como HTML de verdade (proteção básica
    // contra XSS ao injetar texto vindo do usuário no innerHTML).
    const titulo = escapaHtml(tarefa.titulo);
    const descricao = escapaHtml(tarefa.descricao ?? '');
    const categoria = escapaHtml(tarefa.categoria ?? '');

    return `
        <article class="cartao-tarefa" data-id="${tarefa.id}">
            <div class="cartao-tarefa__cabecalho">
                <h2>${titulo}</h2>
                <div class="cartao-tarefa__acoes">
                    <button type="button" class="botao-icone botao-icone--concluir botao-concluir"
                            data-id="${tarefa.id}" title="Marcar como concluída/ativa">✓</button>
                    <button type="button" class="botao-icone botao-editar"
                            data-id="${tarefa.id}" title="Editar">✎</button>
                    <button type="button" class="botao-icone botao-icone--excluir botao-excluir"
                            data-id="${tarefa.id}" title="Excluir">✕</button>
                </div>
            </div>
            ${descricao ? `<p>${descricao}</p>` : ''}
            <div class="etiquetas">
                <span class="etiqueta ${status.classe}">${status.texto}</span>
                <span class="etiqueta ${prioridade.classe}">${prioridade.texto}</span>
                ${categoria ? `<span class="etiqueta">${categoria}</span>` : ''}
            </div>
        </article>
    `;
}

// Conta quantas tarefas existem em cada status e atualiza os números
// nos cards de resumo no topo da página.
function atualizarEstatisticas(tarefas) {
    totalTarefasEl.textContent = tarefas.length;
    totalAtivosEl.textContent = tarefas.filter((t) => t.status === 'ATIVO').length;
    totalPendentesEl.textContent = tarefas.filter((t) => t.status === 'PENDENTE').length;
    totalConcluidosEl.textContent = tarefas.filter((t) => t.status === 'CONCLUIDO').length;
}

// Função utilitária: transforma caracteres especiais de HTML (<, >, &, "...)
// em suas "entidades" equivalentes, pra qualquer texto vindo do banco
// nunca seja interpretado como tag HTML quando inserido via innerHTML.
function escapaHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}


// ============================================================================
// CRIAÇÃO E EDIÇÃO (POST / PUT) - modal
// ============================================================================

// Abre o modal "limpo", pronto pra criar uma tarefa nova.
function abrirModalCriacao() {
    formTarefaEl.reset(); // limpa todos os campos do formulário
    campoIdEl.value = ''; // sem id = modo "criação" pro salvarTarefa()
    modalTituloEl.textContent = 'Nova Tarefa';
    esconderErroModal();
    modalEl.showModal(); // método nativo do <dialog>: abre como modal
    campoTituloEl.focus();
}

// Abre o modal já preenchido com os dados de uma tarefa existente.
function abrirModalEdicao(tarefa) {
    campoIdEl.value = tarefa.id; // com id = modo "edição" pro salvarTarefa()
    campoTituloEl.value = tarefa.titulo;
    campoDescricaoEl.value = tarefa.descricao ?? '';
    campoStatusEl.value = tarefa.status;
    campoPrioridadeEl.value = tarefa.prioridade;
    campoCategoriaEl.value = tarefa.categoria ?? '';
    modalTituloEl.textContent = 'Editar Tarefa';
    esconderErroModal();
    modalEl.showModal();
    campoTituloEl.focus();
}

function fecharModal() {
    modalEl.close(); // método nativo do <dialog>: fecha o modal
}

function mostrarErroModal(mensagem) {
    modalErroEl.textContent = mensagem;
    modalErroEl.hidden = false;
}

function esconderErroModal() {
    modalErroEl.hidden = true;
    modalErroEl.textContent = '';
}

// Roda quando o formulário do modal é enviado (clique em "Salvar" ou
// Enter dentro de um campo de texto).
async function salvarTarefa(evento) {
    // Sem isso, o navegador recarregaria a página inteira ao enviar o
    // formulário (comportamento padrão de <form>), o que destruiria
    // todo o estado da nossa aplicação JS.
    evento.preventDefault();

    // Monta o objeto exatamente com os mesmos nomes de campo que a
    // classe Tarefa.java espera (titulo, descricao, status, prioridade,
    // categoria), porque o Spring vai converter esse JSON direto pra
    // um objeto Tarefa.
    const dadosTarefa = {
        titulo: campoTituloEl.value.trim(),
        descricao: campoDescricaoEl.value.trim(),
        status: campoStatusEl.value,
        prioridade: campoPrioridadeEl.value,
        categoria: campoCategoriaEl.value.trim(),
    };

    const id = campoIdEl.value;
    // Se já existe um id no campo escondido, estamos editando (PUT numa
    // URL com /id). Senão, estamos criando (POST na URL base).
    const estaEditando = id !== '';
    const url = estaEditando ? `${API_URL}/${id}` : API_URL;
    const metodo = estaEditando ? 'PUT' : 'POST';

    try {
        const resposta = await fetch(url, {
            method: metodo,
            // Avisa o servidor que o corpo da requisição é JSON — sem
            // esse header, o Spring não saberia como interpretar o texto
            // que estamos enviando.
            headers: { 'Content-Type': 'application/json' },
            // JSON.stringify converte o objeto JS numa string JSON, que
            // é o formato que viaja pela rede.
            body: JSON.stringify(dadosTarefa),
        });

        if (!resposta.ok) {
            // Tenta ler a mensagem de erro que o backend devolveu (por
            // exemplo, "O título é obrigatório" vindo da validação
            // @NotBlank). Se não conseguir, usa uma mensagem genérica.
            const corpoErro = await resposta.json().catch(() => null);
            const mensagem = corpoErro?.erro ?? 'Não foi possível salvar a tarefa.';
            throw new Error(mensagem);
        }

        fecharModal();
        await carregarTarefas(); // recarrega a lista pra mostrar a mudança
    } catch (erro) {
        mostrarErroModal(erro.message);
    }
}


// ============================================================================
// EXCLUSÃO (DELETE)
// ============================================================================

async function excluirTarefa(id) {
    // confirm() abre o popup nativo do navegador "OK / Cancelar". É uma
    // função SÍNCRONA: o JS para e espera a pessoa responder antes de
    // continuar, então não precisa de await aqui.
    const confirmou = confirm('Tem certeza que deseja excluir essa tarefa?');
    if (!confirmou) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (!resposta.ok) {
            throw new Error('Não foi possível excluir a tarefa.');
        }

        await carregarTarefas();
    } catch (erro) {
        alert(erro.message);
    }
}


// ============================================================================
// ALTERNAR CONCLUÍDO/ATIVO RAPIDAMENTE (botão ✓ do card)
// ============================================================================

async function alternarConclusao(tarefa) {
    // Se já está concluída, volta pra "Ativo". Senão, marca como concluída.
    const novoStatus = tarefa.status === 'CONCLUIDO' ? 'ATIVO' : 'CONCLUIDO';

    try {
        const resposta = await fetch(`${API_URL}/${tarefa.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // Reenviamos TODOS os campos, não só o status, porque o
            // método "atualizar" do TarefaService.java espera o objeto
            // completo (ele substitui título, descrição, etc. também).
            body: JSON.stringify({
                titulo: tarefa.titulo,
                descricao: tarefa.descricao,
                status: novoStatus,
                prioridade: tarefa.prioridade,
                categoria: tarefa.categoria,
            }),
        });

        if (!resposta.ok) {
            throw new Error('Não foi possível atualizar o status.');
        }

        await carregarTarefas();
    } catch (erro) {
        alert(erro.message);
    }
}


// ============================================================================
// EVENTOS - conectar os elementos da página com as funções acima
// ============================================================================

// Abrir modal de criação
botaoNovoItemEl.addEventListener('click', abrirModalCriacao);

// Cancelar fecha o modal sem salvar
botaoCancelarEl.addEventListener('click', fecharModal);

// Enviar o formulário (criar ou editar, dependendo do campo-id)
formTarefaEl.addEventListener('submit', salvarTarefa);

// Busca e filtros: re-renderiza a lista filtrada a cada mudança
campoBuscaEl.addEventListener('input', renderizarTarefas);
filtroStatusEl.addEventListener('change', renderizarTarefas);
filtroCategoriaEl.addEventListener('change', renderizarTarefas);

// "Delegação de eventos": em vez de colocar um addEventListener em CADA
// botão de editar/excluir/concluir (que nem existem ainda quando a página
// carrega, já que são criados dinamicamente pelo innerHTML), colocamos UM
// único listener no contêiner pai (listaTarefasEl). Quando um clique
// acontece em qualquer lugar dentro dele, conferimos ONDE foi o clique
// usando .closest(), que sobe pela árvore HTML procurando um ancestral
// (ou o próprio elemento) que bata com o seletor CSS informado.
listaTarefasEl.addEventListener('click', (evento) => {
    const botaoEditar = evento.target.closest('.botao-editar');
    const botaoExcluir = evento.target.closest('.botao-excluir');
    const botaoConcluir = evento.target.closest('.botao-concluir');

    if (botaoEditar) {
        const id = Number(botaoEditar.dataset.id);
        const tarefa = tarefasCarregadas.find((t) => t.id === id);
        if (tarefa) abrirModalEdicao(tarefa);
    }

    if (botaoExcluir) {
        const id = Number(botaoExcluir.dataset.id);
        excluirTarefa(id);
    }

    if (botaoConcluir) {
        const id = Number(botaoConcluir.dataset.id);
        const tarefa = tarefasCarregadas.find((t) => t.id === id);
        if (tarefa) alternarConclusao(tarefa);
    }
});

// Fecha o modal automaticamente se a pessoa clicar fora dele (na área
// escura do backdrop). O <dialog> dispara "click" mesmo no clique no
// backdrop; conferimos se o alvo do clique foi o próprio <dialog>
// (e não um elemento de dentro do formulário) pra diferenciar.
modalEl.addEventListener('click', (evento) => {
    if (evento.target === modalEl) {
        fecharModal();
    }
});


// ============================================================================
// PONTO DE PARTIDA: carrega as tarefas assim que o script é executado
// ============================================================================
carregarTarefas();
