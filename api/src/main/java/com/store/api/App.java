package com.store.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@SpringBootApplication
@EnableScheduling
public class App {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(App.class, args);
    }

    private static void loadDotEnv() {
        File[] candidateFiles = new File[]{
                new File(".env"),
                new File("../.env")
        };
        for (File file : candidateFiles) {
            if (file.exists() && file.isFile()) {
                Properties props = new Properties();
                try (FileInputStream fis = new FileInputStream(file)) {
                    props.load(fis);
                    props.forEach((key, value) -> {
                        if (System.getProperty((String) key) == null && System.getenv((String) key) == null) {
                            System.setProperty((String) key, (String) value);
                        }
                    });
                    break;
                } catch (IOException ignored) {}
            }
        }
    }
}
