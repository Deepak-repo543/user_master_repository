package com.master;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.master", "com.common"})
@EnableFeignClients
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class UserMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserMasterApplication.class, args);
        System.out.println("User Master Service running......!!");
    }
}
