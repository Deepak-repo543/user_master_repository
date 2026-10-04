package com.auth.service;

import com.auth.config.JwtService;
import com.auth.dto.LoginRequest;
import com.auth.dto.LoginResponse;
import com.auth.dto.RegisterRequest;
import com.auth.entity.AuthUser;
import com.auth.exception.LoginException;
import com.auth.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        if ((request.getUsername() == null || request.getUsername().isBlank()) && (request.getPassword() == null || request.getPassword().isBlank()))
            throw new LoginException("Username and password are required.");
        if (request.getUsername() == null || request.getUsername().isBlank())
            throw new LoginException("Username is required.");
        if (request.getPassword() == null || request.getPassword().isBlank())
            throw new LoginException("Password is required.");
        authUserRepository.findByUsername(request.getUsername()).orElseThrow(() -> new LoginException("Invalid username."));
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            assert userDetails != null;
            String token = jwtService.generateToken(userDetails);
            return new LoginResponse(token);
        } catch (BadCredentialsException ex) {
            throw new LoginException("Invalid password.");
        }
    }


    public ResponseEntity<String> register(RegisterRequest request) {
        if (authUserRepository.findByUsername(request.getUsername()).isPresent())
            throw new RuntimeException("Username already exists");
        AuthUser user = new AuthUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setEnabled(true);
        authUserRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
}