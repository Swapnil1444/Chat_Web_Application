

const API_BASE_URL = "http://localhost:8082";
let currentChatUser = null; 
let tempFoundUser = null;   
let chatPollInterval = null; // Timer for the open chat only

// ================= INITIALIZATION =================
window.onload = function () {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    if (!userId) {
        window.location.href = "Login.html";
        return;
    }

    document.getElementById("currentUser").textContent = username || "User";
    document.getElementById("currentUserId").textContent = "ID: " + userId;

    loadChats();
};

// ================= CHAT LIST LOGIC =================
async function loadChats() {
    let userId = localStorage.getItem("userId");
    let chatList = document.getElementById("chatList");

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
        let contacts = await response.json();
        chatList.innerHTML = "";

        if (contacts.length === 0) {
            chatList.innerHTML = `<p class="empty-message">No contacts yet.</p>`;
            return;
        }

        contacts.forEach(c => {
            let div = document.createElement("div");
            div.className = "contact-item";
            
            // Clean ID logic (removed notification dataset needs)
            let displayName = c.userName || `User ${c.contactId}`;
            div.dataset.name = displayName.toLowerCase();

            div.innerHTML = `
                <i class="fa fa-user"></i>
                <div class="contact-info">
                    <div class="contact-name">${displayName}</div>
                </div>
            `;
            
            div.onclick = () => openChat(div, c.contactId, displayName);
            chatList.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading chats:", error);
    }
}

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
    // UI Updates
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");

    document.getElementById("noChatSelected").style.display = "none";
    document.getElementById("chatWindow").style.display = "flex";
    document.getElementById("chatTitle").textContent = contactName;
    
    currentChatUser = { id: contactId, name: contactName };

    // Reset Chat Area
    let messagesArea = document.getElementById("messagesArea");
    messagesArea.innerHTML = "Loading...";

    // Polling Logic: Stop old timer, start new one
    if (chatPollInterval) clearInterval(chatPollInterval);
    
    fetchMessages(); // Run once immediately
    chatPollInterval = setInterval(fetchMessages, 2000); // Check ONLY this chat every 2s
}

function closeChat() {
    currentChatUser = null;
    
    // Stop Polling
    if (chatPollInterval) clearInterval(chatPollInterval);
    
    document.getElementById("chatWindow").style.display = "none";
    document.getElementById("noChatSelected").style.display = "flex";
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
}

// Simple Polling: Only updates the currently open chat
async function fetchMessages() {
    if (!currentChatUser) return;

    let userId = localStorage.getItem("userId");
    try {
        let response = await fetch(`${API_BASE_URL}/messages/history/${userId}/${currentChatUser.id}`);
        let messages = await response.json();

        let messagesArea = document.getElementById("messagesArea");
        let currentCount = messagesArea.getElementsByClassName("message").length;

        // Only update if new messages arrived
        if (messages.length > currentCount) {
             messagesArea.innerHTML = ""; 
             messages.forEach(msg => displayMessage(msg, userId));
             messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    } catch (error) {
        console.error("Auto-fetch failed", error);
    }
}

async function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    let userId = localStorage.getItem("userId");

    if (!text || !currentChatUser) return;

    let messageData = {
        senderId: userId,
        receiverId: currentChatUser.id,
        content: text
    };

    // Optimistic UI
    displayMessage({ senderId: userId, content: text }, userId);
    
    let messagesArea = document.getElementById("messagesArea");
    messagesArea.scrollTop = messagesArea.scrollHeight;
    input.value = "";

    try {
        await fetch(`${API_BASE_URL}/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });
    } catch (error) {
        console.error("Network error sending message:", error);
    }
}

function displayMessage(msg, currentUserId) {
    let messagesArea = document.getElementById("messagesArea");
    let isSent = (msg.senderId == currentUserId);
    
    // Clean up empty message placeholder
    let emptyMsg = messagesArea.querySelector(".empty-message");
    if(emptyMsg) emptyMsg.remove(); // Fix: remove specific element if exists, else it might clear "Loading..."

    // If we just loaded "Loading...", clear it
    if (messagesArea.textContent === "Loading...") messagesArea.innerHTML = "";

    let div = document.createElement("div");
    div.className = isSent ? "message sent" : "message received";
    div.textContent = msg.content;
    messagesArea.appendChild(div);
}

function handleKeyPress(event) {
    if (event.key === "Enter") sendMessage();
}

// ================= MODAL LOGIC (Unchanged) =================
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

    if (!username) { msg.textContent = "Enter a username"; return; }

    try {
        let response = await fetch(`${API_BASE_URL}/user/users/find?username=${username}`);
        if (response.ok) {
            let user = await response.json();
            tempFoundUser = user;
            resultArea.style.display = "block";
            document.getElementById("foundUserName").textContent = user.userName;
            msg.textContent = "";
        } else {
            resultArea.style.display = "none";
            msg.textContent = "❌ User not found";
            msg.className = "message error";
        }
    } catch (error) { console.error(error); msg.textContent = "Network Error"; }
}

async function addFoundUser() {
    if (!tempFoundUser) return;
    let userId = localStorage.getItem("userId");
    let msg = document.getElementById("addContactMsg");

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/add?userId=${userId}&contactId=${tempFoundUser.id}`, { method: "POST" });
        if (response.ok) {
            msg.textContent = "✅ Contact added!";
            msg.className = "message";
            loadChats();
            setTimeout(() => closeModal('addContactModal'), 1000);
        } else {
            msg.textContent = "❌ Failed to add";
            msg.className = "message error";
        }
    } catch (error) { msg.textContent = "❌ Error"; }
}

function closeModal(id) { document.getElementById(id).classList.remove("show"); }

function logoutUser() {
    if (confirm("Logout?")) {
        localStorage.clear();
        window.location.href = "Login.html";
    }
}

// ================= PROFILE LOGIC (Unchanged) =================
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
            });
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
            document.getElementById("currentUser").textContent = data.userName;
            setTimeout(() => closeModal("profileModal"), 1500);
        } else { msg.innerHTML = "❌ Failed"; msg.className = "message error"; }
    } catch (error) { msg.innerHTML = "❌ Network error"; }
}

async function deleteAccount() {
    let userId = localStorage.getItem("userId");
    if (!confirm("⚠️ Delete account?")) return;
    try {
        let response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, { method: "DELETE" });
        if (response.ok) { localStorage.clear(); window.location.href = "Login.html"; }
        else { alert("Failed to delete."); }
    } catch (error) { alert("Network error."); }
}