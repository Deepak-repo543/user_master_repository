package com.master.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CurrentUserFilter extends OncePerRequestFilter {

    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static String getCurrentUser() {
        return CURRENT_USER.get();
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String username = request.getHeader("X-User-Name");
            if (username != null && !username.isBlank()) {
                CURRENT_USER.set(username);
            }
            filterChain.doFilter(request, response);
        } finally {
            CURRENT_USER.remove();
        }
    }
}