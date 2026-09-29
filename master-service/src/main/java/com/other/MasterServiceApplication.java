package com.other;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MasterServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MasterServiceApplication.class, args);
		System.out.println("Master Service Start successfully");
	}

}
