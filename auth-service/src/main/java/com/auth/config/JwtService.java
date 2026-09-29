package com.auth.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder().subject(userDetails.getUsername()).claim("role", userDetails.getAuthorities().iterator().next().getAuthority()).claim("userId", resolveUserId(userDetails.getUsername())).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + expiration)).signWith(getSigningKey()).compact();
    }

    private Long resolveUserId(String username) {
        return switch (username) {
            case "admin" -> 1L;
            case "user" -> 2L;
            default -> null;
        };
    }

    public String extractUsername(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername());
    }
}