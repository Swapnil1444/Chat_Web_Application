package com.example.demo;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
	
	@Autowired
	UserRepository repo;
	
	 public User saveUser(User user) {
	        return repo.save(user);
	    }
}
