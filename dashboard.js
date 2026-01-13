const API_BASE_URL = "http://localhost:8082";
let currentChatUser = null; 
let tempFoundUser = null;   
let chatPollInterval = null; 
const notificationSound = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1233-elegant.mp3");

// Map to track local state of unread counts to prevent looping sound
let lastKnownUnreadCounts = {}; 

window.onload = function () {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    if (!userId) { window.location.href = "Login.html"; return; }

    document.getElementById("currentUser").textContent = username || "User";
    document.getElementById("currentUserId").textContent = "ID: " + userId;

    loadChats();

    // Start Polling for Notifications
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(checkNotifications, 2000);
};

// ================= NOTIFICATION LOGIC (POLLING) =================
async function checkNotifications() {
    let userId = localStorage.getItem("userId");

    try {
        // 1. Fetch unread counts from DB
        let response = await fetch(`${API_BASE_URL}/messages/unread/${userId}`);
        let trackers = await response.json();

        // 2. Loop through trackers
        trackers.forEach(tracker => {
            let contactId = tracker.senderId;
            let count = tracker.unreadCount;
            let div = document.querySelector(`.contact-item[data-id='${contactId}']`);

            if (!div) return;

            // Logic: Is this a NEW notification?
            let previousCount = lastKnownUnreadCounts[contactId] || 0;

            if (count > 0) {
                // Apply Highlight
                div.classList.add("has-new-message");

                // Play Sound condition: 
                // 1. Count increased 
                // 2. I am NOT currently inside this chat
                if (count > previousCount && (!currentChatUser || currentChatUser.id != contactId)) {
                    notificationSound.play().catch(e => console.log("Sound blocked"));
                }
                
                // If I AM inside the chat, clear it immediately
                if (currentChatUser && currentChatUser.id == contactId) {
                    clearUnreadInDb(userId, contactId);
                    div.classList.remove("has-new-message"); // visual fix
                }

            } else {
                // Count is 0, remove highlight
                div.classList.remove("has-new-message");
            }

            // Update local memory
            lastKnownUnreadCounts[contactId] = count;
        });
        
        // If chat is open, we still need to fetch messages to see them appear
        if (currentChatUser) {
            refreshOpenChat();
        }

    } catch (error) {
        console.error("Polling error", error);
    }
}

// ================= CHAT LOGIC =================

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
            div.dataset.id = c.contactId; // Critical for notifications
            div.dataset.name = (c.userName || c.contactId).toString().toLowerCase();

            let displayName = c.userName || `User ${c.contactId}`;

            div.innerHTML = `
                <i class="fa fa-user"></i>
                <div class="contact-info">
                    <div class="contact-name">${displayName}</div>
                </div>
            `;
            
            div.onclick = () => openChat(div, c.contactId, displayName);
            chatList.appendChild(div);
        });

    } catch (error) { console.error(error); }
}

function openChat(element, contactId, contactName) {
    // UI Update
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    
    // Remove Unread Highlight immediately in UI
    element.classList.remove("has-new-message");

    document.getElementById("noChatSelected").style.display = "none";
    document.getElementById("chatWindow").style.display = "flex";
    document.getElementById("chatTitle").textContent = contactName;
    
    currentChatUser = { id: contactId, name: contactName };

    // Clear DB Unread Count
    let userId = localStorage.getItem("userId");
    clearUnreadInDb(userId, contactId);

    // Initial Message Load
    refreshOpenChat();
}

function closeChat() {
    currentChatUser = null;
    document.getElementById("chatWindow").style.display = "none";
    document.getElementById("noChatSelected").style.display = "flex";
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
}

async function refreshOpenChat() {
    if (!currentChatUser) return;
    let userId = localStorage.getItem("userId");
    
    let response = await fetch(`${API_BASE_URL}/messages/history/${userId}/${currentChatUser.id}`);
    let messages = await response.json();

    let messagesArea = document.getElementById("messagesArea");
    
    // Simple check to avoid flicker: only redraw if count changes
    let currentCount = messagesArea.getElementsByClassName("message").length;
    if (messages.length > currentCount || messagesArea.textContent === "No messages yet.") {
        messagesArea.innerHTML = "";
        if(messages.length === 0) messagesArea.innerHTML = "No messages yet.";
        
        messages.forEach(msg => {
            let div = document.createElement("div");
            div.className = (msg.senderId == userId) ? "message sent" : "message received";
            div.textContent = msg.content;
            messagesArea.appendChild(div);
        });
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

async function clearUnreadInDb(userId, senderId) {
    // Call backend to set count to 0
    await fetch(`${API_BASE_URL}/messages/unread/clear?userId=${userId}&senderId=${senderId}`, { method: "POST" });
    // Reset local memory so sound can play again next time
    lastKnownUnreadCounts[senderId] = 0; 
}

async function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    let userId = localStorage.getItem("userId");

    if (!text || !currentChatUser) return;

    // Optimistic UI
    let messagesArea = document.getElementById("messagesArea");
    let div = document.createElement("div");
    div.className = "message sent";
    div.textContent = text;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    let msgData = { senderId: userId, receiverId: currentChatUser.id, content: text };
    input.value = "";

    await fetch(`${API_BASE_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData)
    });
}

// ================= MODAL & UTILS (Same as before) =================
function filterChats() {
    let input = document.getElementById("searchChatsInput").value.toLowerCase();
    document.querySelectorAll(".contact-item").forEach(item => {
        item.style.display = item.dataset.name.includes(input) ? "flex" : "none";
    });
}
function handleKeyPress(e) { if (e.key === "Enter") sendMessage(); }
function logoutUser() { if(confirm("Logout?")) { localStorage.clear(); window.location.href = "Login.html"; } }

// Add Contact & Profile Modal functions remain exactly as they were in your previous version...
// (Assuming you kept them. If you need them re-pasted, let me know!)
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
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedUser)
        });
        if (response.ok) {
            let data = await response.json();
            msg.innerHTML = "✅ Updated!";
            localStorage.setItem("username", data.userName);
            setTimeout(() => closeModal("profileModal"), 1500);
        } else msg.innerHTML = "❌ Failed";
    } catch (e) { msg.innerHTML = "❌ Error"; }
}
async function deleteAccount() {
    let userId = localStorage.getItem("userId");
    if(confirm("Delete?")) {
        await fetch(`${API_BASE_URL}/user/delete/${userId}`, { method: "DELETE" });
        localStorage.clear(); window.location.href = "Login.html";
    }
}