// const API_BASE_URL = "http://localhost:8082";
// let currentChatUser = null; 
// let tempFoundUser = null;   
// let chatPollInterval = null; 
// const notificationSound = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1233-elegant.mp3");

// // Map to track local state of unread counts to prevent looping sound
// let lastKnownUnreadCounts = {}; 

// window.onload = function () {
//     const userId = localStorage.getItem("userId");
//     const username = localStorage.getItem("username");

//     if (!userId) { window.location.href = "Login.html"; return; }

//     document.getElementById("currentUser").textContent = username || "User";
//     document.getElementById("currentUserId").textContent = "ID: " + userId;

//     // ADD THIS LINE:
//     if(document.getElementById("welcomeUserName")) 
//         document.getElementById("welcomeUserName").textContent = username || "User";
//     // ... rest of code ...

//     loadChats();

//     // Start Polling for Notifications
//     if (chatPollInterval) clearInterval(chatPollInterval);
//     chatPollInterval = setInterval(checkNotifications, 2000);
// };

// // ================= NOTIFICATION LOGIC (POLLING) =================
// async function checkNotifications() {
//     let userId = localStorage.getItem("userId");

//     try {
//         // 1. Fetch unread counts from DB
//         let response = await fetch(`${API_BASE_URL}/messages/unread/${userId}`);
//         let trackers = await response.json();

//         // 2. Loop through trackers
//         trackers.forEach(tracker => {
//             let contactId = tracker.senderId;
//             let count = tracker.unreadCount;
//             let div = document.querySelector(`.contact-item[data-id='${contactId}']`);

//             if (!div) return;

//             // Logic: Is this a NEW notification?
//             let previousCount = lastKnownUnreadCounts[contactId] || 0;

//             if (count > 0) {
//                 // Apply Highlight
//                 div.classList.add("has-new-message");

//                 // Play Sound condition: 
//                 // 1. Count increased 
//                 // 2. I am NOT currently inside this chat
//                 if (count > previousCount && (!currentChatUser || currentChatUser.id != contactId)) {
//                     notificationSound.play().catch(e => console.log("Sound blocked"));
//                 }
                
//                 // If I AM inside the chat, clear it immediately
//                 if (currentChatUser && currentChatUser.id == contactId) {
//                     clearUnreadInDb(userId, contactId);
//                     div.classList.remove("has-new-message"); // visual fix
//                 }

//             } else {
//                 // Count is 0, remove highlight
//                 div.classList.remove("has-new-message");
//             }

//             // Update local memory
//             lastKnownUnreadCounts[contactId] = count;
//         });
        
//         // If chat is open, we still need to fetch messages to see them appear
//         if (currentChatUser) {
//             refreshOpenChat();
//         }

//     } catch (error) {
//         console.error("Polling error", error);
//     }
// }

// // ================= CHAT LOGIC =================

// async function loadChats() {
//     let userId = localStorage.getItem("userId");
//     let chatList = document.getElementById("chatList");

//     try {
//         let response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
//         let contacts = await response.json();
//         chatList.innerHTML = "";

//         if (contacts.length === 0) {
//             chatList.innerHTML = `<p class="empty-message">No contacts yet.</p>`;
//             return;
//         }

//         contacts.forEach(c => {
//             let div = document.createElement("div");
//             div.className = "contact-item";
//             div.dataset.id = c.contactId; // Critical for notifications
//             div.dataset.name = (c.userName || c.contactId).toString().toLowerCase();

//             let displayName = c.userName || `User ${c.contactId}`;
//             let avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

//             div.innerHTML = `
//                 <img src="${avatarUrl}" class="user-avatar" alt="User">
//                 <div class="contact-info">
//                     <div class="contact-name">${displayName}</div>
//                     <div class="contact-preview">Click to chat</div>
//                 </div>
//             `;
//             div.onclick = () => openChat(div, c.contactId, displayName);
//             chatList.appendChild(div);
//         });

//     } catch (error) { console.error(error); }
// }

// function openChat(element, contactId, contactName) {
//     // UI Update
//     document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
//     element.classList.add("active");
    
//     // Remove Unread Highlight immediately in UI
//     element.classList.remove("has-new-message");

//     document.getElementById("noChatSelected").style.display = "none";
//     document.getElementById("chatWindow").style.display = "flex";
//     document.getElementById("chatTitle").textContent = contactName;
    
//     currentChatUser = { id: contactId, name: contactName };

//     // Clear DB Unread Count
//     let userId = localStorage.getItem("userId");
//     clearUnreadInDb(userId, contactId);

//     // Initial Message Load
//     refreshOpenChat();
// }

// function closeChat() {
//     currentChatUser = null;
//     document.getElementById("chatWindow").style.display = "none";
//     document.getElementById("noChatSelected").style.display = "flex";
//     document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
// }

// async function refreshOpenChat() {
//     if (!currentChatUser) return;
//     let userId = localStorage.getItem("userId");
    
//     let response = await fetch(`${API_BASE_URL}/messages/history/${userId}/${currentChatUser.id}`);
//     let messages = await response.json();

//     let messagesArea = document.getElementById("messagesArea");
    
//     // Simple check to avoid flicker: only redraw if count changes
//     let currentCount = messagesArea.getElementsByClassName("message").length;
//     if (messages.length > currentCount || messagesArea.textContent === "No messages yet.") {
//         messagesArea.innerHTML = "";
//         if(messages.length === 0) messagesArea.innerHTML = "No messages yet.";
        
//         messages.forEach(msg => {
//             let div = document.createElement("div");
//             div.className = (msg.senderId == userId) ? "message sent" : "message received";
//             div.textContent = msg.content;
//             messagesArea.appendChild(div);
//         });
//         messagesArea.scrollTop = messagesArea.scrollHeight;
//     }
// }

// async function clearUnreadInDb(userId, senderId) {
//     // Call backend to set count to 0
//     await fetch(`${API_BASE_URL}/messages/unread/clear?userId=${userId}&senderId=${senderId}`, { method: "POST" });
//     // Reset local memory so sound can play again next time
//     lastKnownUnreadCounts[senderId] = 0; 
// }

// async function sendMessage() {
//     let input = document.getElementById("messageInput");
//     let text = input.value.trim();
//     let userId = localStorage.getItem("userId");

//     if (!text || !currentChatUser) return;

//     // Optimistic UI
//     let messagesArea = document.getElementById("messagesArea");
//     let div = document.createElement("div");
//     div.className = "message sent";
//     div.textContent = text;
//     messagesArea.appendChild(div);
//     messagesArea.scrollTop = messagesArea.scrollHeight;
    
//     let msgData = { senderId: userId, receiverId: currentChatUser.id, content: text };
//     input.value = "";

//     await fetch(`${API_BASE_URL}/messages/send`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(msgData)
//     });
// }

// // ================= MODAL & UTILS (Same as before) =================
// function filterChats() {
//     let input = document.getElementById("searchChatsInput").value.toLowerCase();
//     document.querySelectorAll(".contact-item").forEach(item => {
//         item.style.display = item.dataset.name.includes(input) ? "flex" : "none";
//     });
// }
// function handleKeyPress(e) { if (e.key === "Enter") sendMessage(); }
// function logoutUser() { if(confirm("Logout?")) { localStorage.clear(); window.location.href = "Login.html"; } }

// // Add Contact & Profile Modal functions remain exactly as they were in your previous version...
// // (Assuming you kept them. If you need them re-pasted, let me know!)
// function openAddContactModal() {
//     document.getElementById("addContactModal").classList.add("show");
//     document.getElementById("searchResults").style.display = "none";
//     document.getElementById("globalSearchInput").value = "";
//     document.getElementById("addContactMsg").textContent = "";
// }

// async function searchGlobalUser() {
//     let username = document.getElementById("globalSearchInput").value.trim();
//     let msg = document.getElementById("addContactMsg");
//     let resultArea = document.getElementById("searchResults");

//     if (!username) { msg.textContent = "Enter a username"; return; }

//     try {
//         let response = await fetch(`${API_BASE_URL}/user/users/find?username=${username}`);
//         if (response.ok) {
//             let user = await response.json();
//             tempFoundUser = user;
//             resultArea.style.display = "block";
//             document.getElementById("foundUserName").textContent = user.userName;
//             msg.textContent = "";
//         } else {
//             resultArea.style.display = "none";
//             msg.textContent = "❌ User not found";
//             msg.className = "message error";
//         }
//     } catch (error) { console.error(error); msg.textContent = "Network Error"; }
// }

// async function addFoundUser() {
//     if (!tempFoundUser) return;
//     let userId = localStorage.getItem("userId");
//     let msg = document.getElementById("addContactMsg");

//     try {
//         let response = await fetch(`${API_BASE_URL}/contacts/add?userId=${userId}&contactId=${tempFoundUser.id}`, { method: "POST" });
//         if (response.ok) {
//             msg.textContent = "✅ Contact added!";
//             msg.className = "message";
//             loadChats();
//             setTimeout(() => closeModal('addContactModal'), 1000);
//         } else {
//             msg.textContent = "❌ Failed to add";
//             msg.className = "message error";
//         }
//     } catch (error) { msg.textContent = "❌ Error"; }
// }

// function closeModal(id) { document.getElementById(id).classList.remove("show"); }

// function openProfileModal() {
//     document.getElementById("profileModal").classList.add("show");
//     let userId = localStorage.getItem("userId");
//     if (userId) document.getElementById("profileUserId").textContent = "User ID: " + userId;
//     let username = localStorage.getItem("username");
//     if (username) {
//         fetch(`${API_BASE_URL}/user/details?username=${username}`)
//             .then(res => res.json())
//             .then(data => {
//                 document.getElementById("profileUsername").value = data.userName;
//                 document.getElementById("profileEmail").value = data.email;
//                 document.getElementById("profilePhone").value = data.phoneNumber;
//             });
//     }
// }

// async function updateProfile() {
//     let msg = document.getElementById("profileMsg");
//     let userId = localStorage.getItem("userId");
//     let updatedUser = {
//         userName: document.getElementById("profileUsername").value,
//         email: document.getElementById("profileEmail").value,
//         phoneNumber: document.getElementById("profilePhone").value,
//         password: document.getElementById("profilePassword").value
//     };
//     try {
//         let response = await fetch(`${API_BASE_URL}/user/update/${userId}`, {
//             method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedUser)
//         });
//         if (response.ok) {
//             let data = await response.json();
//             msg.innerHTML = "✅ Updated!";
//             localStorage.setItem("username", data.userName);
//             setTimeout(() => closeModal("profileModal"), 1500);
//         } else msg.innerHTML = "❌ Failed";
//     } catch (e) { msg.innerHTML = "❌ Error"; }
// }
// async function deleteAccount() {
//     let userId = localStorage.getItem("userId");
//     if(confirm("Delete?")) {
//         await fetch(`${API_BASE_URL}/user/delete/${userId}`, { method: "DELETE" });
//         localStorage.clear(); window.location.href = "Login.html";
//     }
// }

// function displayMessage(msg, currentUserId) {
//     let messagesArea = document.getElementById("messagesArea");
    
//     // Clear "No messages" text if it exists
//     if (messagesArea.textContent === "No messages yet." || messagesArea.textContent === "Loading...") {
//         messagesArea.innerHTML = "";
//     }

//     let div = document.createElement("div");
//     let isSent = (msg.senderId == currentUserId);
//     div.className = isSent ? "message sent" : "message received";

//     // Format the time (e.g., "10:30 PM")
//     // Note: If msg.timestamp is missing (optimistic UI), use current time
//     let dateObj = msg.timestamp ? new Date(msg.timestamp) : new Date();
//     let timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//     div.innerHTML = `
//         <div class="msg-content">${msg.content}</div>
//         <div class="msg-time">${timeString}</div>
//     `;
    
//     messagesArea.appendChild(div);
// }


const API_BASE_URL = "http://localhost:8082";
let currentChatUser = null; 
let tempFoundUser = null;   
let chatPollInterval = null; 
// Use a local file if possible, or a reliable CDN. 
const notificationSound = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1233-elegant.mp3");

// Map to track local state of unread counts
let lastKnownUnreadCounts = {}; 

window.onload = function () {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    // 1. Security Check: No ID = Go to Login
    if (!userId) { 
        window.location.href = "Login.html"; 
        return; 
    }

    // 2. UI Initialization
    document.getElementById("currentUser").textContent = username || "User";
    if(document.getElementById("currentUserId"))
        document.getElementById("currentUserId").textContent = "ID: " + userId;

    if(document.getElementById("welcomeUserName")) 
        document.getElementById("welcomeUserName").textContent = username || "User";

    // 3. Load Data
    loadChats();

    // 4. Start Polling (Background Task)
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(checkNotifications, 2000);
};

// ================= NOTIFICATION LOGIC (POLLING) =================
async function checkNotifications() {
    let userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        let response = await fetch(`${API_BASE_URL}/messages/unread/${userId}`);

        // Security Fix: If session expired (401), logout immediately
        if (response.status === 401) {
            handleSessionExpired();
            return;
        }

        if (!response.ok) return; // Ignore other server errors silently in background

        let trackers = await response.json();

        trackers.forEach(tracker => {
            let contactId = tracker.senderId;
            let count = tracker.unreadCount;
            let div = document.querySelector(`.contact-item[data-id='${contactId}']`);

            if (!div) return;

            let previousCount = lastKnownUnreadCounts[contactId] || 0;

            if (count > 0) {
                div.classList.add("has-new-message");

                // Play Sound only if count INCREASED and chat is NOT open
                if (count > previousCount && (!currentChatUser || currentChatUser.id != contactId)) {
                    notificationSound.play().catch(() => {}); // Catch play errors (browsers block auto-audio)
                }
                
                // If I am inside the chat, clear it immediately
                if (currentChatUser && currentChatUser.id == contactId) {
                    clearUnreadInDb(userId, contactId);
                    div.classList.remove("has-new-message");
                }
            } else {
                div.classList.remove("has-new-message");
            }

            lastKnownUnreadCounts[contactId] = count;
        });
        
        // Refresh open chat to see new incoming messages
        if (currentChatUser) {
            refreshOpenChat();
        }

    } catch (error) {
        // Keep console clean, don't spam network errors
    }
}

// ================= CHAT LOGIC =================

async function loadChats() {
    let userId = localStorage.getItem("userId");
    let chatList = document.getElementById("chatList");

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/${userId}`);
        
        if (response.status === 401) { handleSessionExpired(); return; }
        
        if (!response.ok) throw new Error("Failed to load");

        let contacts = await response.json();
        chatList.innerHTML = "";

        if (contacts.length === 0) {
            chatList.innerHTML = `<p class="empty-message">No contacts yet. Click '+' to add one.</p>`;
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

    } catch (error) { 
        chatList.innerHTML = `<p class="error-message">Could not load contacts.</p>`;
    }
}

function openChat(element, contactId, contactName) {
    // UI Update
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
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

async function refreshOpenChat() {
    if (!currentChatUser) return;
    let userId = localStorage.getItem("userId");
    
    try {
        let response = await fetch(`${API_BASE_URL}/messages/history/${userId}/${currentChatUser.id}`);
        if (!response.ok) return;

        let messages = await response.json();
        let messagesArea = document.getElementById("messagesArea");
        
        // Prevent flickering: Only update if count changed or it's the first load
        let currentCount = messagesArea.querySelectorAll(".message").length;
        
        if (messages.length > currentCount || messagesArea.innerText.includes("No messages")) {
            messagesArea.innerHTML = "";
            if(messages.length === 0) messagesArea.innerHTML = "<p class='empty-message'>No messages yet. Say hi! 👋</p>";
            
            messages.forEach(msg => displayMessage(msg, userId));
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    } catch (e) {
        // Silent fail for background refresh
    }
}

async function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    let userId = localStorage.getItem("userId");

    if (!text || !currentChatUser) return;

    // 1. Optimistic UI: Show message immediately
    let messagesArea = document.getElementById("messagesArea");
    // Remove "No messages" placeholder if it exists
    if(messagesArea.querySelector(".empty-message")) messagesArea.innerHTML = "";

    let tempDiv = document.createElement("div");
    tempDiv.className = "message sent"; 
    tempDiv.innerHTML = `<div class="msg-content">${text}</div><div class="msg-time">Sending...</div>`;
    messagesArea.appendChild(tempDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    input.value = ""; // Clear input

    try {
        let msgData = { senderId: userId, receiverId: currentChatUser.id, content: text };
        let response = await fetch(`${API_BASE_URL}/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(msgData)
        });

        if (response.ok) {
            // Update timestamp on success
            let now = new Date();
            tempDiv.querySelector(".msg-time").textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            throw new Error("Failed");
        }
    } catch (error) {
        // Visual Feedback for Error
        tempDiv.style.border = "1px solid red";
        tempDiv.querySelector(".msg-time").textContent = "Failed to send ❌";
        tempDiv.querySelector(".msg-time").style.color = "red";
    }
}

// ================= UTILS & MODALS =================

function displayMessage(msg, currentUserId) {
    let messagesArea = document.getElementById("messagesArea");
    if (messagesArea.querySelector(".empty-message")) messagesArea.innerHTML = "";

    let div = document.createElement("div");
    let isSent = (msg.senderId == currentUserId);
    div.className = isSent ? "message sent" : "message received";

    let dateObj = msg.timestamp ? new Date(msg.timestamp) : new Date();
    let timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="msg-content">${msg.content}</div>
        <div class="msg-time">${timeString}</div>
    `;
    messagesArea.appendChild(div);
}

async function clearUnreadInDb(userId, senderId) {
    try {
        await fetch(`${API_BASE_URL}/messages/unread/clear?userId=${userId}&senderId=${senderId}`, { method: "POST" });
        lastKnownUnreadCounts[senderId] = 0; 
    } catch(e) { console.error("Failed to clear unread", e); }
}

function handleSessionExpired() {
    if (chatPollInterval) clearInterval(chatPollInterval);
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "Login.html";
}

// --- Search / Add User Logic ---

async function searchGlobalUser() {
    let username = document.getElementById("globalSearchInput").value.trim();
    let msg = document.getElementById("addContactMsg");
    let resultArea = document.getElementById("searchResults");

    if (!username) { 
        msg.textContent = "⚠️ Please enter a username"; 
        msg.className = "message error";
        return; 
    }

    msg.textContent = "🔍 Searching...";
    msg.className = "message";

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
    } catch (error) { 
        msg.textContent = "❌ Network Error"; 
        msg.className = "message error";
    }
}

async function addFoundUser() {
    if (!tempFoundUser) return;
    let userId = localStorage.getItem("userId");
    let msg = document.getElementById("addContactMsg");
    let btn = document.querySelector("#searchResults button"); // The "Add" button

    // Loading State
    let originalText = btn.textContent;
    btn.textContent = "Adding...";
    btn.disabled = true;

    try {
        let response = await fetch(`${API_BASE_URL}/contacts/add?userId=${userId}&contactId=${tempFoundUser.id}`, { method: "POST" });
        
        if (response.ok) {
            msg.textContent = "✅ Contact added!";
            msg.className = "message success";
            loadChats(); // Refresh sidebar
            setTimeout(() => {
                closeModal('addContactModal');
                // Reset UI
                btn.textContent = originalText;
                btn.disabled = false;
                document.getElementById("searchResults").style.display = "none";
            }, 1000);
        } else {
            throw new Error("Failed");
        }
    } catch (error) { 
        msg.textContent = "❌ Failed to add contact";
        msg.className = "message error";
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// --- Profile Update Logic ---

async function updateProfile() {
    let msg = document.getElementById("profileMsg");
    let userId = localStorage.getItem("userId");
    
    msg.innerHTML = "⏳ Updating...";
    msg.className = "message";

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
            msg.innerHTML = "✅ Profile updated!";
            msg.className = "message success";
            localStorage.setItem("username", data.userName);
            document.getElementById("currentUser").textContent = data.userName;
            setTimeout(() => closeModal("profileModal"), 1500);
        } else { 
            msg.innerHTML = "❌ Update failed"; 
            msg.className = "message error";
        }
    } catch (e) { 
        msg.innerHTML = "❌ Network error"; 
        msg.className = "message error";
    }
}

// Standard Utils
function filterChats() {
    let input = document.getElementById("searchChatsInput").value.toLowerCase();
    document.querySelectorAll(".contact-item").forEach(item => {
        item.style.display = item.dataset.name.includes(input) ? "flex" : "none";
    });
}
function handleKeyPress(e) { if (e.key === "Enter") sendMessage(); }
function logoutUser() { 
    if(confirm("Are you sure you want to logout?")) { 
        localStorage.clear(); 
        window.location.href = "Login.html"; 
    } 
}
function openAddContactModal() {
    document.getElementById("addContactModal").classList.add("show");
    document.getElementById("searchResults").style.display = "none";
    document.getElementById("globalSearchInput").value = "";
    document.getElementById("addContactMsg").textContent = "";
}
function closeModal(id) { document.getElementById(id).classList.remove("show"); }
async function openProfileModal() {
    document.getElementById("profileModal").classList.add("show");
    
    let userId = localStorage.getItem("userId");
    let username = localStorage.getItem("username");

    // 1. Display Static ID
    if (userId) {
        document.getElementById("profileUserId").textContent = "User ID: " + userId;
    }

    // 2. Set "Loading..." placeholders while we fetch data
    document.getElementById("profileUsername").value = "Loading...";
    document.getElementById("profileEmail").value = "Loading...";
    document.getElementById("profilePhone").value = "Loading...";
    document.getElementById("profilePassword").value = ""; // Always keep password empty

    // 3. Fetch latest details from Backend
    try {
        let response = await fetch(`${API_BASE_URL}/user/details?username=${encodeURIComponent(username)}`);
        
        if (response.ok) {
            let data = await response.json();
            
            // 4. Populate Inputs with Real Data
            document.getElementById("profileUsername").value = data.userName || "";
            document.getElementById("profileEmail").value = data.email || "";
            document.getElementById("profilePhone").value = data.phoneNumber || "";
        } else {
            // Fallback if server fails
            console.error("Failed to load profile details");
            document.getElementById("profileUsername").value = username; 
            document.getElementById("profileEmail").value = "";
            document.getElementById("profilePhone").value = "";
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

async function deleteAccount() {
    let userId = localStorage.getItem("userId");
    if(confirm("⚠️ Are you sure? This cannot be undone.")) {
        try {
            await fetch(`${API_BASE_URL}/user/delete/${userId}`, { method: "DELETE" });
            localStorage.clear(); 
            window.location.href = "Login.html";
        } catch(e) { alert("Delete failed"); }
    }
}

function closeChat() {
    // 1. Reset current user
    currentChatUser = null;

    // 2. Hide Chat Window, Show "Welcome" Screen
    document.getElementById("chatWindow").style.display = "none";
    document.getElementById("noChatSelected").style.display = "flex";

    // 3. Remove "Active" visual from sidebar
    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
}