package com.example.demo;

public class ContactDTO {
    private Long contactId;
    private String userName;

    public ContactDTO(Long contactId, String userName) {
        this.contactId = contactId;
        this.userName = userName;
    }

    // Getters and Setters
    public Long getContactId() { return contactId; }
    public void setContactId(Long contactId) { this.contactId = contactId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}