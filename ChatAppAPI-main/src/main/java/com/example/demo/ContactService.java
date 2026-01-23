package com.example.demo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepo;

    @Autowired
    private UserRepository userRepo; // Fix naming to UserRepository

    public List<ContactDTO> getContactsByUserId(Long userId) {
        List<Contact> contacts = contactRepo.findByUserId(userId);
        
        // Convert list of Contact Entities to list of ContactDTOs
        return contacts.stream().map(contact -> {
            String name = userRepo.findById(contact.getContactId())
                          .map(User::getUserName)
                          .orElse("Unknown");
            return new ContactDTO(contact.getContactId(), name);
        }).toList();
    }

    public Contact addContact(Long userId, Long contactId) {
        // Prevent adding yourself
        if (userId.equals(contactId)) {
            throw new RuntimeException("Cannot add yourself");
        }
        // Check if actually exists
        if (!userRepo.existsById(contactId)) {
             throw new RuntimeException("User not found");
        }
        Contact contact = new Contact(userId, contactId);
        return contactRepo.save(contact);
    }
    // ... delete method ...

    public void deleteContact(Long id) {
        contactRepo.deleteById(id);
    }
}