package com.api.API32025.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF để tránh lỗi bảo mật khi gọi API từ Postman
                .cors(withDefaults()) // Cho phép CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**") // Cho phép tất cả các API trong /api/auth mà không cần login
                                .permitAll()
                        .requestMatchers("/api/profile/**")
                                .permitAll()
                        .requestMatchers("/api/upload/**").hasAnyAuthority("CUSTOMER", "CAROWNER","ADMIN")
//                              .authenticated()


                        .anyRequest().authenticated() // Các API khác yêu cầu xác thực
                )
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Không dùng session
//                )
                .build();
    }

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000") // Nếu frontend chạy ở React/Vue trên cổng 3000
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
    // Tắt
    @Bean
    public UserDetailsService userDetailsService() {
        // Nếu không có UserDetailsService, Spring sẽ tạo user mặc định
        return new InMemoryUserDetailsManager();
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
