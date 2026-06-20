package com.sharktask.backend.model;

// Mesmo princípio do StatusTarefa: um conjunto fixo de prioridades.
// A ordem em que você escreve os valores não importa para o banco
// (cada um vira um texto), mas importa se um dia você quiser ordenar
// tarefas por prioridade usando a posição no enum (Enum.ordinal()).
public enum PrioridadeTarefa {
    BAIXA,
    MEDIA,
    ALTA,
    URGENTE
}
