package com.sharktask.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication faz 3 coisas de uma vez:
// 1. Marca essa classe como ponto de entrada da configuração do Spring
// 2. Ativa a configuração automática (ele descobre sozinho que você
//    quer um servidor web e um banco H2, por exemplo, baseado no pom.xml)
// 3. Diz pro Spring escanear este pacote (com.sharktask.backend) e todos
//    os pacotes filhos (model, repository, service, controller, config)
//    procurando classes que ele deve gerenciar
@SpringBootApplication
public class SharktaskBackendApplication {

	// Esse é o método main, igual o de qualquer programa Java comum.
	// É ele que o comando "mvn spring-boot:run" executa.
	public static void main(String[] args) {
		// SpringApplication.run faz o "boot" de toda a aplicação:
		// sobe o servidor Tomcat embutido, cria as conexões com o banco,
		// registra os controllers, etc. Tudo isso com essa única linha.
		SpringApplication.run(SharktaskBackendApplication.class, args);
	}
}
