const API_BASE_URL = "http://localhost:8082";
let currentChatUser = null; // Stores the user currently opened in chat
let tempFoundUser = null;   // Stores the user found in the Add Contact modal
let chatPollInterval = null; // <--- ADD THIS LINE

// ================= INITIALIZATION =================
window.onload = function () {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    if (!userId) {
        window.location.href = "Login.html"; // Redirect if not logged in
        return;
    }

    // Set Header Info
    document.getElementById("currentUser").textContent = username || "User";
    document.getElementById("currentUserId").textContent = "ID: " + userId;

    loadChats(); // Load contacts/chats
};

// ================= CHAT LIST LOGIC =================

// 1. Fetch Contacts from Backend
async function loadChats() {
    let userId = localStorage.getItem("userId");
    let chatList = document.getElementById("chatList");

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
        
        if (!response.ok) {
            chatList.innerHTML = `<p class="empty-message">❌ Failed to load chats</p>`;
            return;
        }

        let contacts = await response.json();
        chatList.innerHTML = ""; // Clear list

        if (contacts.length === 0) {
            chatList.innerHTML = `<p class="empty-message">No contacts yet.<br>Click 'Add New Contact' below.</p>`;
            return;
        }

        // Render Contacts
        contacts.forEach(c => {
            let div = document.createElement("div");
            div.className = "contact-item";
            div.dataset.name = (c.userName || c.contactId).toString().toLowerCase(); // For search filtering

            // Display Name Logic (Uses Name if available, otherwise ID)
            let displayName = c.userName || `User ${c.contactId}`;

            div.innerHTML = `
                <i class="fa fa-user"></i>
                <div class="contact-info">
                    <div class="contact-name">${displayName}</div>
                </div>
            `;
            
            // Click to Open Chat
            div.onclick = () => openChat(div, c.contactId, displayName);
            
            chatList.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading chats:", error);
        chatList.innerHTML = `<p class="empty-message">❌ Network error</p>`;
    }
}

// 2. Filter Chats (Search Bar)
function filterChats() {
    let input = document.getElementById("searchChatsInput").value.toLowerCase();
    let items = document.querySelectorAll(".contact-item");

    items.forEach(item => {
        if (item.dataset.name.includes(input)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

// ================= CHAT WINDOW LOGIC =================

function openChat(element, contactId, contactName) {
    // 1. Highlight selected contact
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");

    // 2. Show Chat Window
    document.getElementById("noChatSelected").style.display = "none";
    document.getElementById("chatWindow").style.display = "flex";
    
    // 3. Set Chat Header
    document.getElementById("chatTitle").textContent = contactName;
    currentChatUser = { id: contactId, name: contactName };

    // 4. Reset Area
    let messagesArea = document.getElementById("messagesArea");
    messagesArea.innerHTML = "Loading...";

    // 5. STOP any previous polling (so we don't have double timers)
    if (chatPollInterval) clearInterval(chatPollInterval);

    // 6. Initial Load & START Polling
    fetchMessages(); // Run once immediately
    chatPollInterval = setInterval(fetchMessages, 2000); // Run every 2 seconds
}
function closeChat() {
    currentChatUser = null;
    
    // STOP Polling
    if (chatPollInterval) clearInterval(chatPollInterval);
    
    document.getElementById("chatWindow").style.display = "none";
    document.getElementById("noChatSelected").style.display = "flex";
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
}

async function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    let userId = localStorage.getItem("userId");

    if (!text || !currentChatUser) return;

    // 1. Prepare Message Object
    let messageData = {
        senderId: userId,
        receiverId: currentChatUser.id,
        content: text
    };

    // 2. Optimistic UI (Show message immediately before server confirms)
    displayMessage({ senderId: userId, content: text }, userId);
    
    let messagesArea = document.getElementById("messagesArea");
    messagesArea.scrollTop = messagesArea.scrollHeight;
    input.value = ""; // Clear input

    // 3. Send to Backend
    try {
        let response = await fetch(`${API_BASE_URL}/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (!response.ok) {
            console.error("Failed to send message");
            // Optional: You could show a red error icon next to the message here
        }
    } catch (error) {
        console.error("Network error sending message:", error);
    }
}


function displayMessage(msg, currentUserId) {
    let messagesArea = document.getElementById("messagesArea");
    
    // Remove "empty" message if it exists
    let emptyMsg = messagesArea.querySelector(".empty-message");
    if (emptyMsg) emptyMsg.remove();

    let div = document.createElement("div");
    
    // Check if I sent it or received it
    // Note: We compare as strings/numbers loosely just in case
    let isSent = (msg.senderId == currentUserId);
    
    div.className = isSent ? "message sent" : "message received";
    div.textContent = msg.content;
    
    messagesArea.appendChild(div);
}

async function fetchMessages() {
    if (!currentChatUser) return;

    let userId = localStorage.getItem("userId");
    try {
        // Fetch latest history
        let response = await fetch(`${API_BASE_URL}/messages/history/${userId}/${currentChatUser.id}`);
        let messages = await response.json();

        let messagesArea = document.getElementById("messagesArea");

        // Simple logic: If message count changed, update the UI
        // (For a perfect app, you'd check IDs, but this is fine for now)
        let currentCount = messagesArea.getElementsByClassName("message").length;
        
        if (messages.length > currentCount) {
             messagesArea.innerHTML = ""; // Clear and rebuild
             messages.forEach(msg => {
                displayMessage(msg, userId);
            });
            messagesArea.scrollTop = messagesArea.scrollHeight; // Auto-scroll to bottom
        }

    } catch (error) {
        console.error("Auto-fetch failed", error);
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter") sendMessage();
}

// ================= ADD CONTACT LOGIC (Global Search) =================

function openAddContactModal() {
    document.getElementById("addContactModal").classList.add("show");
    document.getElementById("searchResults").style.display = "none";
    document.getElementById("globalSearchInput").value = "";
    document.getElementById("addContactMsg").textContent = "";
}

async function searchGlobalUser() {
    let username = document.getElementById("globalSearchInput").value.trim();
    let msg = document.getElementById("addContactMsg");
    let resultArea = document.getElementById("searchResults");

    if (!username) {
        msg.textContent = "Please enter a username";
        return;
    }

    try {
        let response = await fetch(`${API_BASE_URL}/user/users/find?username=${username}`);
        
        if (response.ok) {
            let user = await response.json();
            
            // Show result
            tempFoundUser = user; // Store found user data
            resultArea.style.display = "block";
            document.getElementById("foundUserName").textContent = user.userName; // Assuming 'userName' is in JSON
            msg.textContent = "";
        } else {
            resultArea.style.display = "none";
            msg.textContent = "❌ User not found";
            msg.className = "message error";
        }
    } catch (error) {
        console.error(error);
        msg.textContent = "❌ Network Error";
    }
}

async function addFoundUser() {
    if (!tempFoundUser) return;

    let userId = localStorage.getItem("userId");
    let contactId = tempFoundUser.id; // The ID of the user we found
    let msg = document.getElementById("addContactMsg");

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/add?userId=${userId}&contactId=${contactId}`, {
            method: "POST"
        });

        if (response.ok) {
            msg.textContent = "✅ Contact added!";
            msg.className = "message";
            
            // Reload sidebar list
            loadChats();
            
            setTimeout(() => closeModal('addContactModal'), 1000);
        } else {
            msg.textContent = "❌ Failed to add (maybe already added?)";
            msg.className = "message error";
        }
    } catch (error) {
        msg.textContent = "❌ Error adding contact";
    }
}

// ================= UTILS & EXISTING USER LOGIC =================

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

function logoutUser() {
    if (confirm("Logout?")) {
        localStorage.clear();
        window.location.href = "Login.html";
    }
}

// === EXISTING PROFILE LOGIC (Preserved as requested) ===

function openProfileModal() {
    document.getElementById("profileModal").classList.add("show");
    let userId = localStorage.getItem("userId");
    if (userId) document.getElementById("profileUserId").textContent = "User ID: " + userId;

    let username = localStorage.getItem("username");
    if (username) {
        fetch(`${API_BASE_URL}/user/details?username=${username}`)
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
    
    let updatedUser = {
        userName: document.getElementById("profileUsername").value,
        email: document.getElementById("profileEmail").value,
        phoneNumber: document.getElementById("profilePhone").value,
        password: document.getElementById("profilePassword").value
    };

    try {
        let response = await fetch(`${API_BASE_URL}/user/update/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            let data = await response.json();
            msg.innerHTML = "✅ Profile updated!";
            msg.className = "message";
            localStorage.setItem("username", data.userName);
            document.getElementById("currentUser").textContent = data.userName; // Update header immediately
            setTimeout(() => closeModal("profileModal"), 1500);
        } else {
            msg.innerHTML = "❌ Failed to update";
            msg.className = "message error";
        }
    } catch (error) {
        msg.innerHTML = "❌ Network error";
    }
}

async function deleteAccount() {
    let userId = localStorage.getItem("userId");
    if (!confirm("⚠️ Delete account permanently?")) return;

    try {
        let response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, { method: "DELETE" });
        if (response.ok) {
            alert("Account deleted.");
            localStorage.clear();
            window.location.href = "Login.html";
        } else {
            alert("Failed to delete.");
        }
    } catch (error) {
        alert("Network error.");
    }
}