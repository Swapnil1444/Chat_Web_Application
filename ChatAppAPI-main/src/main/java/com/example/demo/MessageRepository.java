package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetch messages where (Sender is A and Receiver is B) OR (Sender is B and Receiver is A)
    // Ordered by time so the chat reads correctly
    @Query("SELECT m FROM Message m WHERE (m.senderId = :user1 AND m.receiverId = :user2) " +
           "OR (m.senderId = :user2 AND m.receiverId = :user1) ORDER BY m.timestamp ASC")
    List<Message> findChatHistory(@Param("user1") Long user1, @Param("user2") Long user2);
}