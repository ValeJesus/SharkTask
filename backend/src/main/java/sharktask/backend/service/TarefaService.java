package com.sharktask.backend.service;

import com.sharktask.backend.model.Tarefa;
import com.sharktask.backend.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// @Service marca essa classe como um "componente de serviço": ela fica
// entre o Controller (que recebe a requisição HTTP) e o Repository
// (que conversa com o banco). É aqui que colocamos regras de negócio —
// neste CRUD simples, a maior parte é só repassar a chamada pro
// repository, mas em projetos maiores é aqui que ficaria, por exemplo,
// "uma tarefa só pode ser marcada como concluída se tiver uma descrição".
@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;

    // Esse é um construtor com @Autowired: o Spring vê que essa classe
    // precisa de um TarefaRepository para funcionar, e injeta
    // automaticamente uma instância dele aqui. Esse padrão se chama
    // "injeção de dependência" — nós nunca escrevemos
    // "new TarefaRepository()" manualmente, o Spring cuida disso.
    @Autowired
    public TarefaService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }

    // Lista todas as tarefas cadastradas.
    public List<Tarefa> listarTodas() {
        return tarefaRepository.findAll();
    }

    // Busca uma tarefa específica pelo id. Se não existir, lança a
    // exceção personalizada que criamos.
    public Tarefa buscarPorId(Long id) {
        return tarefaRepository.findById(id)
                .orElseThrow(() -> new TarefaNaoEncontradaException(id));
    }

    // Cria uma nova tarefa. O "save" do JpaRepository serve tanto para
    // criar quanto para atualizar — ele decide com base em o objeto já
    // ter um id preenchido ou não.
    public Tarefa criar(Tarefa tarefa) {
        return tarefaRepository.save(tarefa);
    }

    // Atualiza uma tarefa existente.
    public Tarefa atualizar(Long id, Tarefa dadosNovos) {
        // Primeiro buscamos a tarefa atual — isso já lança
        // TarefaNaoEncontradaException se o id não existir.
        Tarefa tarefaExistente = buscarPorId(id);

        // Copiamos campo por campo os dados novos para o objeto
        // existente. Fazemos assim (em vez de simplesmente salvar
        // "dadosNovos") para preservar o id e a dataCriacao originais.
        tarefaExistente.setTitulo(dadosNovos.getTitulo());
        tarefaExistente.setDescricao(dadosNovos.getDescricao());
        tarefaExistente.setStatus(dadosNovos.getStatus());
        tarefaExistente.setPrioridade(dadosNovos.getPrioridade());
        tarefaExistente.setCategoria(dadosNovos.getCategoria());

        return tarefaRepository.save(tarefaExistente);
    }

    // Remove uma tarefa pelo id.
    public void deletar(Long id) {
        // Confirma que a tarefa existe antes de tentar deletar — assim
        // conseguimos devolver um erro 404 claro em vez de um erro
        // genérico do banco se o id não existir.
        if (!tarefaRepository.existsById(id)) {
            throw new TarefaNaoEncontradaException(id);
        }
        tarefaRepository.deleteById(id);
    }
}
