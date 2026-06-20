package com.sharktask.backend.service;

// Uma exceção customizada deixa o código mais expressivo: em vez de
// lançar um RuntimeException genérico, criamos um tipo específico que
// diz exatamente o que aconteceu. O controller vai "escutar" esse tipo
// de exceção e transformar ela numa resposta HTTP 404.
public class TarefaNaoEncontradaException extends RuntimeException {

    public TarefaNaoEncontradaException(Long id) {
        // super(...) chama o construtor da classe pai (RuntimeException),
        // passando a mensagem de erro que ela vai carregar.
        super("Tarefa com id " + id + " não encontrada");
    }
}
