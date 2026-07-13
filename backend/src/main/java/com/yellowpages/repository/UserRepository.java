package com.yellowpages.repository;

import com.yellowpages.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    java.util.List<User> findByRole(String role);
    java.util.List<User> findByRoleIn(java.util.List<String> roles);
}
