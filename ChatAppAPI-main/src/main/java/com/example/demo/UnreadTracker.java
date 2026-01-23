package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "unread_tracker")
public class UnreadTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;     // The person who HAS unread messages (Receiver)
    private Long senderId;   // The person who SENT the messages
    private int unreadCount; // How many messages are waiting

    public UnreadTracker() {}

    public UnreadTracker(Long userId, Long senderId, int unreadCount) {
        this.userId = userId;
        this.senderId = senderId;
        this.unreadCount = unreadCount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    
    public void increment() { this.unreadCount++; }
}