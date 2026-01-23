package com.example.demo;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contacts")
//@CrossOrigin("*") 
public class ContactController {

    @Autowired
    private ContactService contactService;

    // ✅ FIXED: Return List<ContactDTO> instead of List<Contact>
    @GetMapping("/{userId}")
    public ResponseEntity<List<ContactDTO>> getContacts(@PathVariable Long userId) {
        List<ContactDTO> contacts = contactService.getContactsByUserId(userId);
        return ResponseEntity.ok(contacts);
    }

    @PostMapping("/add")
    public ResponseEntity<Contact> addContact(@RequestParam Long userId, @RequestParam Long contactId) {
        Contact contact = contactService.addContact(userId, contactId);
        return ResponseEntity.ok(contact);
    }
}