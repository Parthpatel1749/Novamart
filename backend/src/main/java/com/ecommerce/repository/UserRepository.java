package com.ecommerce.repository;

import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Boolean existsByGoogleId(String googleId);
    List<User> findByRole(Role role);
    long countByRole(Role role);
}
