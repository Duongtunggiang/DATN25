package com.api.API32025.jwt;

import com.api.API32025.entity.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String SECRET = "9f4bC6e8!gBv2tJmLxWqYzPlRkVuXyZq";
    private final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(Account account) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", account.getRole().getRoleName());
        claims.put("email", account.getEmail());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(String.valueOf(account.getId()))
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return (String) claims.get("role");
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserId(String token) {
        return Long.valueOf(extractAllClaims(token).getSubject());
    }

    public boolean isTokenValid(String token) {
        return !extractAllClaims(token).getExpiration().before(new Date());
    }
}


