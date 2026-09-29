package com.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.jspecify.annotations.NonNull;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class JwtUserGlobalFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public @NonNull Mono<Void> filter(ServerWebExchange exchange, @NonNull GatewayFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
                String username = claims.getSubject();
                String role = claims.get("role", String.class);
                if (username != null && role != null) {
                    ServerHttpRequest mutatedRequest = exchange.getRequest().mutate().header("X-User-Name", username).header("X-User-Role", role).build();
                    exchange = exchange.mutate().request(mutatedRequest).build();
                }
            } catch (Exception e) {
                log.warn("JWT validation failed: {}", e.getMessage());
            }
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}