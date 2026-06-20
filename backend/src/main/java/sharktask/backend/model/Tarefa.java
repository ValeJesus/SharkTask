package com.sharktask.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

// @Entity diz pro Spring/Hibernate: "essa classe representa uma tabela
// no banco de dados". Cada objeto Tarefa que existir vira uma linha
// dessa tabela.
@Entity
// @Table define explicitamente o nome da tabela no banco.
// Sem essa anotação, o Hibernate usaria o nome da classe (tarefa),
// mas é uma boa prática deixar explícito.
@Table(name = "tarefas")
public class Tarefa {

    // @Id marca esse campo como a chave primária da tabela.
    @Id
    // @GeneratedValue diz que o banco gera o valor automaticamente
    // (1, 2, 3, ...) — nós nunca definimos o id manualmente.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @NotBlank é uma validação: impede que o título chegue vazio,
    // nulo, ou só com espaços em branco. Se isso acontecer, o Spring
    // recusa a requisição antes mesmo de chegar no controller, desde
    // que a gente use @Valid no controller (fazemos isso mais adiante).
    @NotBlank(message = "O título é obrigatório")
    @Column(nullable = false)
    private String titulo;

    // Sem @NotBlank aqui porque a descrição é opcional.
    @Column(length = 1000)
    private String descricao;

    // @Enumerated(EnumType.STRING) diz pro Hibernate salvar o enum como
    // texto no banco ("ATIVO", "PENDENTE"...) em vez de número (0, 1, 2).
    // Isso é importante: se você reordenar o enum no futuro, salvar como
    // número quebraria os dados antigos. Como STRING, fica sempre legível
    // e seguro.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTarefa status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadeTarefa prioridade;

    // Categoria fica como texto livre (Projeto, Trabalho, Ideia, Infra...)
    // em vez de enum, porque no frontend essa lista pode crescer sem
    // precisar mexer no backend.
    private String categoria;

    // Guardamos quando a tarefa foi criada. LocalDateTime é a classe do
    // Java moderno (java.time) para representar data + hora.
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    // Construtor vazio: o JPA/Hibernate EXIGE um construtor sem argumentos
    // para conseguir criar objetos Tarefa "vazios" e depois preencher os
    // campos via reflection quando lê dados do banco.
    public Tarefa() {
    }

    // Construtor de conveniência, usado quando criamos uma tarefa nova
    // a partir dos dados que chegam da requisição.
    public Tarefa(String titulo, String descricao, StatusTarefa status,
                  PrioridadeTarefa prioridade, String categoria) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.status = status;
        this.prioridade = prioridade;
        this.categoria = categoria;
        this.dataCriacao = LocalDateTime.now();
    }

    // @PrePersist é um "gancho" do JPA: esse método roda automaticamente
    // UMA VEZ, bem antes do Hibernate salvar a tarefa pela primeira vez.
    // Garante que dataCriacao sempre é preenchida, mesmo que alguém crie
    // a tarefa sem usar o construtor de cima.
    @PrePersist
    protected void aoCriar() {
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
    }

    // ---- Getters e Setters ----
    // O Hibernate (e o conversor de JSON do Spring) usa esses métodos
    // para ler e escrever os valores dos campos. Por isso eles existem
    // mesmo parecendo repetitivos: é assim que objetos Java "conversam"
    // com bibliotecas externas sem expor os campos diretamente (encapsulamento).

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusTarefa getStatus() {
        return status;
    }

    public void setStatus(StatusTarefa status) {
        this.status = status;
    }

    public PrioridadeTarefa getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeTarefa prioridade) {
        this.prioridade = prioridade;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
