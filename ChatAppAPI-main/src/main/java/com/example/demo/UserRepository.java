package com.example.demo;


import com.example.demo.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Return Optional<User> for safer null handling
    Optional<User> findByUserName(String userName);

    // For login, you can still return User directly
    User findByUserNameAndPassword(String userName, String password);
}