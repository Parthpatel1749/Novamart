package com.ecommerce.security;

import com.ecommerce.security.ratelimit.RateLimitingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAuthenticationFilter authenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;

    public SecurityConfig(JwtAuthenticationEntryPoint authenticationEntryPoint,
                          JwtAuthenticationFilter authenticationFilter,
                          RateLimitingFilter rateLimitingFilter) {
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.authenticationFilter = authenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(authenticationEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // Authenticated user actions under /api/auth
                .requestMatchers("/api/auth/me", "/api/auth/google/unlink").authenticated()

                // Public authentication and recovery endpoints
                .requestMatchers("/api/auth/**").permitAll()
                
                // Public catalog browsing
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/coupons/validate/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/delivery-zones/public/**").permitAll()
                
                // Delivery Partner Registration and Login are open
                .requestMatchers("/api/delivery-partners/register", "/api/delivery-partners/login").permitAll()
                
                // H2 Console, actuator health & metrics, error
                .requestMatchers("/h2-console/**", "/error", "/actuator/health", "/actuator/info", "/actuator/metrics/**", "/actuator/prometheus").permitAll()
                
                // Admin specific routes
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                
                // Delivery partner dashboard and execution routes
                .requestMatchers("/api/delivery-partners/**").hasAnyAuthority("ROLE_DELIVERY_PARTNER", "ROLE_ADMIN")
                
                // Customer & general authenticated actions
                .anyRequest().authenticated()
            );

        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
