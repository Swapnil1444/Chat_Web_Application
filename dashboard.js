// Sample data for contacts and rooms
let contacts = [
    { id: 1, username: "john_doe", status: "online" },
    { id: 2, username: "jane_smith", status: "offline" },
    { id: 3, username: "mike_johnson", status: "online" }
];

let rooms = [
    { id: 1, name: "General Chat", members: 15, code: "GEN001" },
    { id: 2, name: "Tech Discussion", members: 8, code: "TECH001" },
    { id: 3, name: "Gaming Zone", members: 12, code: "GAME001" }
];

let messages = {
    contact_1: [
        { text: "Hey! How are you?", type: "received" },
        { text: "I'm doing great! How about you?", type: "sent" }
    ],
    contact_2: [],
    room_1: [
        { text: "Welcome to General Chat!", type: "received" },
        { text: "Thanks! Happy to be here", type: "sent" }
    ]
};

let currentChat = null;
let currentUser = localStorage.getItem("username") || "User";

// Initialize dashboard on page load
window.onload = function() {
    document.getElementById("currentUser").textContent = currentUser;
    loadContacts();
    loadRooms();
};

// Load contacts list
function loadContacts() {
    let contactsList = document.getElementById("contactsList");
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="empty-message">No contacts yet. Add a contact to start chatting!</p>';
        return;
    }

    contactsList.innerHTML = "";
    contacts.forEach(contact => {
        let contactItem = document.createElement("div");
        contactItem.className = "contact-item";
        contactItem.onclick = () => openChat("contact", contact.id, contact.username);
        
        let statusClass = contact.status === "online" ? "fa-circle" : "fa-circle";
        let statusColor = contact.status === "online" ? "#00ff99" : "#666";
        
        contactItem.innerHTML = `
            <i class="fa fa-user-circle"></i>
            <div class="contact-info">
                <div class="contact-name">${contact.username}</div>
                <div class="contact-status"><i class="fa ${statusClass}" style="color: ${statusColor}; font-size: 8px;"></i> ${contact.status}</div>
            </div>
        `;
        
        contactsList.appendChild(contactItem);
    });
}

// Load rooms list
function loadRooms() {
    let roomsList = document.getElementById("roomsList");
    if (rooms.length === 0) {
        roomsList.innerHTML = '<p class="empty-message">No rooms joined yet. Create or join a room!</p>';
        return;
    }

    roomsList.innerHTML = "";
    rooms.forEach(room => {
        let roomItem = document.createElement("div");
        roomItem.className = "room-item";
        roomItem.onclick = () => openChat("room", room.id, room.name);
        
        roomItem.innerHTML = `
            <i class="fa fa-door-open"></i>
            <div class="room-info">
                <div class="room-name">${room.name}</div>
                <div class="room-members"><i class="fa fa-users"></i> ${room.members} members</div>
            </div>
        `;
        
        roomsList.appendChild(roomItem);
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });
    
    // Remove active class from all buttons
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Show selected tab
    document.getElementById(tabName + "Tab").classList.add("active");
    
    // Add active class to clicked button
    event.target.classList.add("active");
}

// Open chat window
function openChat(type, id, name) {
    currentChat = { type, id, name };
    
    // Update UI
    document.getElementById("noChatSelected").style.display = "none";
    document.getElementById("chatWindow").style.display = "flex";
    document.getElementById("chatTitle").textContent = name;
    
    // Load messages
    let messagesArea = document.getElementById("messagesArea");
    let messageKey = `${type}_${id}`;
    
    messagesArea.innerHTML = "";
    
    if (messages[messageKey] && messages[messageKey].length > 0) {
        messages[messageKey].forEach(msg => {
            let msgElement = document.createElement("div");
            msgElement.className = `message ${msg.type}`;
            msgElement.textContent = msg.text;
            messagesArea.appendChild(msgElement);
        });
    } else {
        messagesArea.innerHTML = '<p class="empty-message">Start the conversation!</p>';
    }
    
    // Update active state in sidebar
    document.querySelectorAll(".contact-item, .room-item").forEach(item => {
        item.classList.remove("active");
    });
    event.currentTarget.classList.add("active");
    
    // Focus message input
    document.getElementById("messageInput").focus();
}

// Send message
function sendMessage() {
    let messageInput = document.getElementById("messageInput");
    let messageText = messageInput.value.trim();
    
    if (messageText === "" || !currentChat) return;
    
    let messagesArea = document.getElementById("messagesArea");
    
    // Clear empty message
    let emptyMsg = messagesArea.querySelector(".empty-message");
    if (emptyMsg) emptyMsg.remove();
    
    // Create message element
    let msgElement = document.createElement("div");
    msgElement.className = "message sent";
    msgElement.textContent = messageText;
    messagesArea.appendChild(msgElement);
    
    // Store message
    let messageKey = `${currentChat.type}_${currentChat.id}`;
    if (!messages[messageKey]) messages[messageKey] = [];
    messages[messageKey].push({ text: messageText, type: "sent" });
    
    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    // Clear input
    messageInput.value = "";
    
    // Simulate response after 1 second
    setTimeout(() => {
        let responseMsg = document.createElement("div");
        responseMsg.className = "message received";
        responseMsg.textContent = "Thanks for your message!";
        messagesArea.appendChild(responseMsg);
        
        messages[messageKey].push({ text: "Thanks for your message!", type: "received" });
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 1000);
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// Close chat
function closeChat() {
    currentChat = null;
    document.getElementById("noChatSelected").style.display = "flex";
    document.getElementById("chatWindow").style.display = "none";
    document.querySelectorAll(".contact-item, .room-item").forEach(item => {
        item.classList.remove("active");
    });
}

// Open add contact modal
function openAddContact() {
    document.getElementById("addContactModal").classList.add("show");
}

// Open create room modal
function openCreateRoom() {
    document.getElementById("createRoomModal").classList.add("show");
}

// Open join room modal
function openJoinRoom() {
    document.getElementById("joinRoomModal").classList.add("show");
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("show");
}

// Add contact
function addContact() {
    let username = document.getElementById("contactUsername").value.trim();
    let msg = document.getElementById("contactMsg");
    
    if (username === "") {
        msg.innerHTML = "❌ Please enter username";
        msg.className = "message error";
        return;
    }
    
    // Check if contact already exists
    if (contacts.some(c => c.username === username)) {
        msg.innerHTML = "❌ Contact already exists";
        msg.className = "message error";
        return;
    }
    
    // Add new contact
    contacts.push({
        id: contacts.length + 1,
        username: username,
        status: "offline"
    });
    
    msg.innerHTML = "✅ Contact added successfully!";
    msg.className = "message";
    
    document.getElementById("contactUsername").value = "";
    
    setTimeout(() => {
        closeModal("addContactModal");
        loadContacts();
    }, 1500);
}

// Create room
function createRoom() {
    let roomName = document.getElementById("roomName").value.trim();
    let roomDesc = document.getElementById("roomDesc").value.trim();
    let msg = document.getElementById("roomMsg");
    
    if (roomName === "") {
        msg.innerHTML = "❌ Please enter room name";
        msg.className = "message error";
        return;
    }
    
    // Check if room already exists
    if (rooms.some(r => r.name === roomName)) {
        msg.innerHTML = "❌ Room already exists";
        msg.className = "message error";
        return;
    }
    
    // Generate room code
    let roomCode = "ROOM" + Math.floor(Math.random() * 10000);
    
    // Add new room
    rooms.push({
        id: rooms.length + 1,
        name: roomName,
        members: 1,
        code: roomCode,
        description: roomDesc
    });
    
    msg.innerHTML = "✅ Room created successfully! Code: " + roomCode;
    msg.className = "message";
    
    document.getElementById("roomName").value = "";
    document.getElementById("roomDesc").value = "";
    
    setTimeout(() => {
        closeModal("createRoomModal");
        loadRooms();
    }, 1500);
}

// Join room
function joinRoom() {
    let roomCode = document.getElementById("roomCode").value.trim();
    let msg = document.getElementById("joinMsg");
    
    if (roomCode === "") {
        msg.innerHTML = "❌ Please enter room code";
        msg.className = "message error";
        return;
    }
    
    // Find room by code
    let room = rooms.find(r => r.code === roomCode);
    
    if (!room) {
        msg.innerHTML = "❌ Invalid room code";
        msg.className = "message error";
        return;
    }
    
    msg.innerHTML = "✅ Joined " + room.name + " successfully!";
    msg.className = "message";
    
    document.getElementById("roomCode").value = "";
    
    setTimeout(() => {
        closeModal("joinRoomModal");
        loadRooms();
    }, 1500);
}

// Search contacts
function searchContacts() {
    let searchInput = document.getElementById("searchInput").value.toLowerCase();
    let contactItems = document.querySelectorAll(".contact-item");
    
    contactItems.forEach(item => {
        let contactName = item.querySelector(".contact-name").textContent.toLowerCase();
        if (contactName.includes(searchInput)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

// Show chat info
function showInfo() {
    if (!currentChat) return;
    alert(`Chat: ${currentChat.name}\nType: ${currentChat.type}`);
}

// Logout user
function logoutUser() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("username");
        window.location.href = "Login.html";
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    let modals = document.querySelectorAll(".modal.show");
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });
};

// profile model 
function openProfileModal() {
    document.getElementById("profileModal").classList.add("show");

    // Display User ID
    let userId = localStorage.getItem("userId");
    if (userId) {
        document.getElementById("profileUserId").textContent = "User ID: " + userId;
    }

    // Pre-fill user details from backend
    let username = localStorage.getItem("username");
    if (username) {
        fetch("http://localhost:8082/user/details?username=" + username)
            .then(res => res.json())
            .then(data => {
                document.getElementById("profileUsername").value = data.userName;
                document.getElementById("profileEmail").value = data.email;
                document.getElementById("profilePhone").value = data.phoneNumber;
            })
            .catch(err => console.error("Failed to load profile", err));
    }
}

async function updateProfile() {
    let msg = document.getElementById("profileMsg");
    let userId = localStorage.getItem("userId");

    if (!userId) {
        msg.innerHTML = "❌ User ID not found. Please log in again.";
        msg.className = "message error";
        return;
    }

    let updatedUser = {
        userName: document.getElementById("profileUsername").value,
        email: document.getElementById("profileEmail").value,
        phoneNumber: document.getElementById("profilePhone").value,
        password: document.getElementById("profilePassword").value
    };

    try {
        let response = await fetch(`http://localhost:8082/user/update/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            let data = await response.json();
            msg.innerHTML = "✅ Profile updated successfully!";
            msg.className = "message";

            localStorage.setItem("username", data.userName);

            setTimeout(() => closeModal("profileModal"), 1500);
        } else {
            msg.innerHTML = "❌ Failed to update profile";
            msg.className = "message error";
        }
    } catch (error) {
        msg.innerHTML = "❌ Network error";
        msg.className = "message error";
    }
}

async function deleteAccount() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        alert("❌ User ID not found. Please log in again.");
        return;
    }

    if (!confirm("⚠️ Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
        let response = await fetch("http://localhost:8082/user/delete/" + userId, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Account deleted successfully.");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            window.location.href = "Login.html";
        } else {
            alert("❌ Failed to delete account.");
        }
    } catch (error) {
        alert("❌ Network error.");
    }
}