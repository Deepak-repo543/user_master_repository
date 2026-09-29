package com.master.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {

            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return;
            }

            HttpServletRequest request = attributes.getRequest();

            String authorization = request.getHeader("Authorization");
            String username = request.getHeader("X-User-Name");
            String role = request.getHeader("X-User-Role");

            if (authorization != null && !authorization.isBlank()) {
                requestTemplate.header("Authorization", authorization);
            }

            if (username != null && !username.isBlank()) {
                requestTemplate.header("X-User-Name", username);
            }

            if (role != null && !role.isBlank()) {
                requestTemplate.header("X-User-Role", role);
            }
        };
    }
}