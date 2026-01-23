package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/messages")
// @CrossOrigin("*") // handled by WebConfig
public class MessageController {

    @Autowired private MessageRepository messageRepo;
    @Autowired private UnreadTrackerRepository unreadRepo; // Inject the new repo

    // 1. Send Message AND Increment Unread Count
    @PostMapping("/send")
    public Message sendMessage(@RequestBody Message message) {
        message.setTimestamp(LocalDateTime.now());
        Message savedMsg = messageRepo.save(message);

        // -- LOGIC: Increment Unread Count for the Receiver --
        Optional<UnreadTracker> trackerOpt = unreadRepo.findByUserIdAndSenderId(message.getReceiverId(), message.getSenderId());
        
        UnreadTracker tracker;
        if (trackerOpt.isPresent()) {
            tracker = trackerOpt.get();
            tracker.increment();
        } else {
            tracker = new UnreadTracker(message.getReceiverId(), message.getSenderId(), 1);
        }
        unreadRepo.save(tracker);
        // ----------------------------------------------------

        return savedMsg;
    }

    // 2. Fetch Chat History
    @GetMapping("/history/{user1}/{user2}")
    public List<Message> getChatHistory(@PathVariable Long user1, @PathVariable Long user2) {
        return messageRepo.findChatHistory(user1, user2);
    }

    // 3. NEW: Get all unread counts for the logged-in user
    @GetMapping("/unread/{userId}")
    public List<UnreadTracker> getUnreadCounts(@PathVariable Long userId) {
        return unreadRepo.findByUserId(userId);
    }

    // 4. NEW: Clear unread count (When user opens chat)
    @PostMapping("/unread/clear")
    public void clearUnread(@RequestParam Long userId, @RequestParam Long senderId) {
        Optional<UnreadTracker> trackerOpt = unreadRepo.findByUserIdAndSenderId(userId, senderId);
        if (trackerOpt.isPresent()) {
            UnreadTracker tracker = trackerOpt.get();
            tracker.setUnreadCount(0);
            unreadRepo.save(tracker);
        }
    }
}