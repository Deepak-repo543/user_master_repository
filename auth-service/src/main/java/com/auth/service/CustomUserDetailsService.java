package com.auth.service;

import com.auth.entity.AuthUser;
import com.auth.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthUserRepository authUserRepository;

    @Override
    @NullMarked
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        AuthUser authUser = authUserRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return User.builder()
                .username(authUser.getUsername())
                .password(authUser.getPassword())
                .roles(authUser.getRole().replace("ROLE_", ""))
                .disabled(!authUser.isEnabled())
                .build();
    }
}