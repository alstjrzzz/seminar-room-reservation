package com.alstjrzzz.srr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class SeminarRoomReservationServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeminarRoomReservationServerApplication.class, args);
    }

}
