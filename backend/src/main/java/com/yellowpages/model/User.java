package com.yellowpages.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 20)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(unique = true, nullable = false, length = 50)
    private String email;

    @Column(nullable = false, length = 20)
    private String role; // ROLE_BUSINESS, ROLE_ADMIN, ROLE_BUYER, ROLE_EMPLOYEE

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
