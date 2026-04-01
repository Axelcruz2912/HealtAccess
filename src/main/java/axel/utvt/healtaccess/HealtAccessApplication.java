package axel.utvt.healtaccess;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableJpaAuditing

public class HealtAccessApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealtAccessApplication.class, args);
    }

}
