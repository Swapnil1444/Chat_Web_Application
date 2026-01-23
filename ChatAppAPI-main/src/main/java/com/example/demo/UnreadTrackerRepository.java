package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UnreadTrackerRepository extends JpaRepository<UnreadTracker, Long> {
    // Find specific tracker between two people
    Optional<UnreadTracker> findByUserIdAndSenderId(Long userId, Long senderId);
    
    // Find ALL unread counts for a user (to light up the sidebar)
    List<UnreadTracker> findByUserId(Long userId);
}