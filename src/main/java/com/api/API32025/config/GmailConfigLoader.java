package com.api.API32025.config;

import java.io.FileInputStream;
import java.util.Properties;

public class GmailConfigLoader {
    private static final String CONFIG_PATH = "D:/A_Api_Toke/GmailConfig/gmail-config.properties";
    private static Properties properties = new Properties();

    static {
        try (FileInputStream fis = new FileInputStream(CONFIG_PATH)) {
            properties.load(fis);
            System.out.println("Gmail config loaded.");
        } catch (Exception e) {
            System.err.println("Không thể load Gmail config: " + e.getMessage());
        }
    }

    public static String getUsername() {
        return properties.getProperty("spring.mail.username");
    }

    public static String getPassword() {
        return properties.getProperty("spring.mail.password");
    }
}

