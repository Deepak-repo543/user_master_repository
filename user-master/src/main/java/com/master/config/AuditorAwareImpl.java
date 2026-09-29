package com.master.config;

import org.springframework.data.domain.AuditorAware;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAware")
public class AuditorAwareImpl implements AuditorAware<String> {

    @NonNull
    public Optional<String> getCurrentAuditor() {
        return Optional.ofNullable(CurrentUserFilter.getCurrentUser());
    }
}