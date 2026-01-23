const API_BASE_URL = "http://localhost:8082";
let currentChatUser = null;
let tempFoundUser = null;
let chatPollInterval = null;
const notificationSound = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1233-elegant.mp3");

let lastKnownUnreadCounts = {};

window.onload = function () {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    if (!userId) { window.location.href = "Login.html"; return; }

    document.getElementById("currentUser").textContent = username || "User";
    if (document.getElementById("currentUserId"))
        document.getElementById("currentUserId").textContent = "ID: " + userId;

    if (document.getElementById("welcomeUserName"))
        document.getElementById("welcomeUserName").textContent = username || "User";

    loadChats();

    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(checkNotifications, 2000);
};

// ================= NOTIFICATION LOGIC =================
async function checkNotifications() {
    let userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        let response = await fetch(`${API_BASE_URL}/messages/unread/${userId}`);

        if (response.status === 401) { handleSessionExpired(); return; }
        if (!response.ok) return;

        let trackers = await response.json();

        trackers.forEach(tracker => {
            let contactId = tracker.senderId;
            let count = tracker.unreadCount;
            let div = document.querySelector(`.contact-item[data-id='${contactId}']`);

            if (!div) return;

            let previousCount = lastKnownUnreadCounts[contactId] || 0;

            if (count > 0) {
                div.classList.add("has-new-message");
                if (count > previousCount && (!currentChatUser || currentChatUser.id != contactId)) {
                    notificationSound.play().catch(() => { });
                }
                if (currentChatUser && currentChatUser.id == contactId) {
                    clearUnreadInDb(userId, contactId);
                    div.classList.remove("has-new-message");
                }
            } else {
                div.classList.remove("has-new-message");
            }
            lastKnownUnreadCounts[contactId] = count;
        });

        if (currentChatUser) refreshOpenChat();

    } catch (error) { }
}

// ================= CHAT LOGIC =================

async function loadChats() {
    let userId = localStorage.getItem("userId");
    let chatList = document.getElementById("chatList");

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
        if (response.status === 401) { handleSessionExpired(); return; }
        
        let contacts = await response.json();
        chatList.innerHTML = "";

        if (contacts.length === 0) {
            chatList.innerHTML = `<p class="empty-message">No contacts yet.</p>`;
            return;
        }

        contacts.forEach(c => {
            let div = document.createElement("div");
            div.className = "contact-item";
            div.dataset.id = c.contactId;
            div.dataset.name = (c.userName || c.contactId).toString().toLowerCase();

            let displayName = c.userName || `User ${c.contactId}`;
            let avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

            div.innerHTML = `
                <img src="${avatarUrl}" class="user-avatar" alt="User">
                <div class="contact-info">
                    <div class="contact-name">${displayName}</div>
                    <div class="contact-preview">Click to chat</div>
                </div>
            `;
            div.onclick = () => openChat(div, c.contactId, displayName);
            chatList.appendChild(div);
        });
    } catch (error) { chatList.innerHTML = `<p class="error-message">Could not load contacts.</p>`; }
}

// --- CRITICAL FIX: OPEN CHAT ---
function openChat(element, contactId, contactName) {
    // 1. UI Update
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    element.classList.remove("has-new-message");

    // 2. Show Chat Window
    document.getElementById("noChatSelected").style.display = "none";
    document.getElementById("chatWindow").style.display = "flex";
    document.getElementById("chatTitle").textContent = contactName;
    
    currentChatUser = { id: contactId, name: contactName };

    // 3. Data Logic
    let userId = localStorage.getItem("userId");
    clearUnreadInDb(userId, contactId);
    refreshOpenChat();

    // 4. MOBILE HANDLING
    // We toggle a CLASS on the main container. CSS handles the hiding/showing.
    // This prevents the sidebar from disappearing on Desktop.
    document.querySelector(".dashboard-container").classList.add("mobile-chat-active");
}

// --- CRITICAL FIX: CLOSE CHAT ---
function closeChat() {
    currentChatUser = null;
    
    document.getElementById("chatWindow").style.display = "none";
    document.getElementById("noChatSelected").style.display = "flex";
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));

    // Remove the class so Sidebar returns on mobile
    document.querySelector(".dashboard-container").classList.remove("mobile-chat-active");
}

async function refreshOpenChat() {
    if (!currentChatUser) return;
    let userId = localStorage.getItem("userId");
    try {
        let response = await fetch(`${API_BASE_URL}/messages/history/${userId}/${currentChatUser.id}`);
        if (!response.ok) return;

        let messages = await response.json();
        let messagesArea = document.getElementById("messagesArea");

        let currentCount = messagesArea.querySelectorAll(".message").length;
        if (messages.length > currentCount || messagesArea.innerText.includes("No messages")) {
            messagesArea.innerHTML = "";
            if (messages.length === 0) messagesArea.innerHTML = "<p class='empty-message'>No messages yet.</p>";
            messages.forEach(msg => displayMessage(msg, userId));
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    } catch (e) { }
}

async function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    let userId = localStorage.getItem("userId");

    if (!text || !currentChatUser) return;

    let messagesArea = document.getElementById("messagesArea");
    if (messagesArea.querySelector(".empty-message")) messagesArea.innerHTML = "";

    let tempDiv = document.createElement("div");
    tempDiv.className = "message sent";
    tempDiv.innerHTML = `<div class="msg-content">${text}</div><div class="msg-time">Sending...</div>`;
    messagesArea.appendChild(tempDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    input.value = "";

    try {
        let msgData = { senderId: userId, receiverId: currentChatUser.id, content: text };
        await fetch(`${API_BASE_URL}/messages/send`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msgData)
        });
        let now = new Date();
        tempDiv.querySelector(".msg-time").textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        tempDiv.style.border = "1px solid red";
        tempDiv.querySelector(".msg-time").textContent = "Failed";
    }
}

function displayMessage(msg, currentUserId) {
    let messagesArea = document.getElementById("messagesArea");
    if (messagesArea.querySelector(".empty-message")) messagesArea.innerHTML = "";

    let div = document.createElement("div");
    let isSent = (msg.senderId == currentUserId);
    div.className = isSent ? "message sent" : "message received";

    let dateObj = msg.timestamp ? new Date(msg.timestamp) : new Date();
    let timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `<div class="msg-content">${msg.content}</div><div class="msg-time">${timeString}</div>`;
    messagesArea.appendChild(div);
}

async function clearUnreadInDb(userId, senderId) {
    try { await fetch(`${API_BASE_URL}/messages/unread/clear?userId=${userId}&senderId=${senderId}`, { method: "POST" }); lastKnownUnreadCounts[senderId] = 0; } catch (e) { }
}
function handleSessionExpired() { clearInterval(chatPollInterval); alert("Session expired."); localStorage.clear(); window.location.href = "Login.html"; }

// --- Search / Add User / Profile ---
function filterChats() {
    let input = document.getElementById("searchChatsInput").value.toLowerCase();
    document.querySelectorAll(".contact-item").forEach(item => { item.style.display = item.dataset.name.includes(input) ? "flex" : "none"; });
}
function handleKeyPress(e) { if (e.key === "Enter") sendMessage(); }
function logoutUser() { if (confirm("Logout?")) { localStorage.clear(); window.location.href = "Login.html"; } }
function openAddContactModal() { document.getElementById("addContactModal").classList.add("show"); document.getElementById("searchResults").style.display = "none"; document.getElementById("globalSearchInput").value = ""; document.getElementById("addContactMsg").textContent = ""; }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

async function searchGlobalUser() {
    let username = document.getElementById("globalSearchInput").value.trim();
    let msg = document.getElementById("addContactMsg");
    if (!username) { msg.textContent = "Enter username"; return; }
    try {
        let response = await fetch(`${API_BASE_URL}/user/users/find?username=${username}`);
        if (response.ok) {
            let user = await response.json();
            tempFoundUser = user;
            document.getElementById("searchResults").style.display = "block";
            document.getElementById("foundUserName").textContent = user.userName;
            msg.textContent = "";
        } else { msg.textContent = "User not found"; }
    } catch (e) { msg.textContent = "Error"; }
}

async function addFoundUser() {
    if (!tempFoundUser) return;
    let userId = localStorage.getItem("userId");
    try {
        let response = await fetch(`${API_BASE_URL}/contacts/add?userId=${userId}&contactId=${tempFoundUser.id}`, { method: "POST" });
        if (response.ok) { loadChats(); closeModal('addContactModal'); }
    } catch (e) { alert("Failed"); }
}

async function openProfileModal() {
    // 1. Open the Modal
    document.getElementById("profileModal").classList.add("show");

    let userId = localStorage.getItem("userId");
    let username = localStorage.getItem("username");

    // 2. Set "Loading..." while we fetch
    // Use checks to ensure elements exist before setting values
    let nameInput = document.getElementById("profileUsername");
    let emailInput = document.getElementById("profileEmail");
    let phoneInput = document.getElementById("profilePhone");
    let passInput = document.getElementById("profilePassword");

    if (nameInput) nameInput.value = "Loading...";
    if (emailInput) emailInput.value = "Loading...";
    if (phoneInput) phoneInput.value = "Loading...";
    if (passInput) passInput.value = ""; 

    // 3. Fetch Details
    // We use the same endpoint that works for search: /user/users/find
    try {
        let response = await fetch(`${API_BASE_URL}/user/users/find?username=${encodeURIComponent(username)}`);
        
        if (response.ok) {
            let data = await response.json();
            
            // 4. Populate Inputs
            if (nameInput) nameInput.value = data.userName || "";
            if (emailInput) emailInput.value = data.email || "";
            if (phoneInput) phoneInput.value = data.phoneNumber || "";
        } else {
            console.error("User details not found");
            if (nameInput) nameInput.value = username; // Fallback
            if (emailInput) emailInput.value = "";
            if (phoneInput) phoneInput.value = "";
        }
    } catch (error) {
        console.error("Network Error:", error);
        if (nameInput) nameInput.value = username;
    }
}

async function updateProfile() {
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
            localStorage.setItem("username", data.userName);
            document.getElementById("profileMsg").textContent = "Updated!";
            setTimeout(() => closeModal("profileModal"), 1000); 
        }
    } catch (e) { alert("Error"); }
}

async function deleteAccount() {
    if (confirm("Are you sure?")) {
        let userId = localStorage.getItem("userId");
        await fetch(`${API_BASE_URL}/user/delete/${userId}`, { method: "DELETE" });
        localStorage.clear(); window.location.href = "Login.html";
    }
}

// Toggle the menu visibility
function toggleOptionsMenu() {
    const menu = document.getElementById("optionsMenu");
    menu.classList.toggle("show");
}

// Close menu if clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.options-btn') && !event.target.matches('.fa-ellipsis-v')) {
        let menu = document.getElementById("optionsMenu");
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
}

// --- OPTION 1: DELETE CONTACT (Removes from sidebar) ---
async function deleteContact() {
    if(!currentChatUser) return;
    
    if(confirm(`Are you sure you want to remove ${currentChatUser.name}?`)) {
        let userId = localStorage.getItem("userId");
        
        try {
            // API CALL (Make sure your Backend has this!)
            // Example: DELETE /contacts/remove?userId=1&contactId=5
            let response = await fetch(`${API_BASE_URL}/contacts/remove?userId=${userId}&contactId=${currentChatUser.id}`, { 
                method: "DELETE" 
            });

            if (response.ok) {
                // Success: Remove from UI immediately
                closeChat(); // Close the window
                loadChats(); // Refresh sidebar to remove the user
            } else {
                alert("Failed to delete contact.");
            }
        } catch (e) {
            console.error(e);
            alert("Network Error");
        }
    }
}

// --- OPTION 2: CLEAR HISTORY (Keeps contact, deletes messages) ---
async function clearChatHistory() {
    if(!currentChatUser) return;

    if(confirm("Clear all messages in this chat?")) {
        let userId = localStorage.getItem("userId");

        try {
            // API CALL (Make sure your Backend has this!)
            let response = await fetch(`${API_BASE_URL}/messages/clear?userId=${userId}&contactId=${currentChatUser.id}`, { 
                method: "DELETE" 
            });

            if (response.ok) {
                document.getElementById("messagesArea").innerHTML = "<p class='empty-message'>No messages yet.</p>";
            } else {
                alert("Failed to clear history.");
            }
        } catch (e) {
            console.error(e);
        }
    }
}