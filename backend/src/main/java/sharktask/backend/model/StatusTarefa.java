package com.sharktask.backend.model;

// Um enum é um tipo especial em Java que representa um conjunto FIXO de
// valores possíveis. Aqui dizemos: uma tarefa só pode estar em um destes
// três estados, nunca em outro. Isso evita erros como alguém salvar
// status="Concluido" (sem acento) e o sistema não reconhecer.
//
// Cada nome aqui vira uma constante: StatusTarefa.ATIVO, StatusTarefa.PENDENTE, etc.
public enum StatusTarefa {
    ATIVO,
    PENDENTE,
    CONCLUIDO
}
