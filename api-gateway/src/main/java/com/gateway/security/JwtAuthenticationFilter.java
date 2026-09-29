package com.gateway.security;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {
    private final JwtService jwtService;

    @NullMarked
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (exchange.getRequest().getMethod().matches("OPTIONS") || path.equals("/auth/login") || path.equals("/auth/register") || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/uploads"))
            return chain.filter(exchange);
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String username = jwtService.extractUsername(token);
        String role = jwtService.extractRole(token);
        if (username == null || role == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        ServerWebExchange modifiedExchange = exchange.mutate().request(request -> request.headers(headers -> {
            headers.remove("X-User-Name");
            headers.remove("X-User-Role");
            headers.add("X-User-Name", username);
            headers.add("X-User-Role", role);
        })).build();
        return chain.filter(modifiedExchange);
    }
}

