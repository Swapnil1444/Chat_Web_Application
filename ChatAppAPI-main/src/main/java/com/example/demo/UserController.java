package com.example.demo;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
// @CrossOrigin("*") <--- REMOVED (Handled by WebConfig)
public class UserController {

    @Autowired
    private UserRepository repo; // Use UserRepository directly for simplicity

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return repo.save(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        User user = repo.findByUserNameAndPassword(data.get("userName"), data.get("password"));
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/find")
    public ResponseEntity<User> findByUsername(@RequestParam String username) {
        return ResponseEntity.of(repo.findByUserName(username));
    }
    
    @GetMapping("/details")
    public User getUserDetails(@RequestParam String username) {
        return repo.findByUserName(username).orElse(null);
    }

    // ✅ FIXED: Matches JS url "/update/{id}"
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User existingUser = repo.findById(id).orElse(null);
        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        // Only update fields if they are sent
        if (updatedUser.getUserName() != null && !updatedUser.getUserName().isEmpty()) {
            existingUser.setUserName(updatedUser.getUserName());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPhoneNumber() != null && !updatedUser.getPhoneNumber().isEmpty()) {
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(updatedUser.getPassword());
        }

        repo.save(existingUser);
        return ResponseEntity.ok(existingUser);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.ok("User deleted");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }
}