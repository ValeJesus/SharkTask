package com.sharktask.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvConfigurer;
//os navegadores bloqueiam as requisições do js feitas de uma origem ou seja de um dominio e porta
//diferente da que um servidor espera isso se chama politica de mesma origem
// dai essa classe libera o cors (cross origin resource sharing)
//
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // aplica a regra só pras rotas /api/...
                // Em desenvolvimento libera qualquer origem. Em produção,
                // depois tem q trocar pelo endereço exato do frontend,
                // tipo "https://meusite.com".
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
