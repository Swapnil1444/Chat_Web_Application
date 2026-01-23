package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The owner of the contact list
    @Column(nullable = false)
    private Long userId;

    // The contact (another user)
    @Column(nullable = false)
    private Long contactId;

    public Contact() {}

    public Contact(Long userId, Long contactId) {
        this.userId = userId;
        this.contactId = contactId;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }
}