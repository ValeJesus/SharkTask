package com.sharktask.backend.repository;

import com.sharktask.backend.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// @Repository diz pro Spring: "essa interface lida com acesso a dados,
// gerencie ela pra mim Na prática, o Spring Data JPA cria uma
// implementação dessa interface em tempo de execução —  nunca
// escreve o código por trás, só declara o que precisa.
//
// JpaRepository<Tarefa, Long> já vem PRONTO com métodos como:
//   save(tarefa)       -> insere ou atualiza
//   findById(id)        -> busca por id
//   findAll()            -> lista tudo
//   deleteById(id)       -> remove
// O "Tarefa" diz qual entidade esse repository gerencia.
// O "Long" diz qual é o tipo do id dessa entidade.
@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    // Não precisa escrever nada aqui dentro para o CRUD básico —
    // tudo já vem herdado do JpaRepository.
    //
    // se der no futuro por exemplo, "buscar tarefas por status",
    // basta declarar a assinatura do método seguindo a convenção de nomes

}
