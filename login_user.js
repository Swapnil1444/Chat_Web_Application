async function loginUser() {
    let user = document.getElementById("loginUser").value.trim();
    let pass = document.getElementById("loginPass").value.trim();
    let msg = document.getElementById("loginMsg");

    // 1. Validation: Check for empty fields
    if (user === "" || pass === "") {
        msg.innerHTML = "⚠️ Please enter both Username and Password";
        msg.className = "message error";
        return;
    }

    // Show loading state
    msg.innerHTML = "⏳ Verifying...";
    msg.className = "message";

    try {
        let response = await fetch("http://localhost:8082/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: user,
                password: pass
            })
        });

        // 2. Handle Success (HTTP 200 OK)
        if (response.ok) {
            let data = await response.json();

            if (data && data.userName) {
                msg.innerHTML = "✅ Login Successful! Redirecting...";
                msg.className = "message success"; // Ensure you have a success class in CSS

                // Store user details
                localStorage.setItem("userId", data.id);
                localStorage.setItem("username", data.userName);

                // Redirect
                setTimeout(() => {
                    window.location.href = "Dashboard.html";
                }, 1500);
            } else {
                msg.innerHTML = "❌ Login failed: Invalid response from server";
                msg.className = "message error";
            }
        } 
        // 3. Handle Specific HTTP Errors
        else {
            // Try to get the error message sent by the backend (if any)
            let errorText = "Login failed";
            try {
                let errorData = await response.json();
                errorText = errorData.message || errorData.error || "Login failed";
            } catch (e) {
                // If backend didn't send JSON, use status text
                errorText = response.statusText; 
            }

            if (response.status === 401 || response.status === 404) {
                msg.innerHTML = "❌ Invalid Username or Password"; 
            } else if (response.status === 500) {
                msg.innerHTML = "❌ Server error. Please try again later.";
            } else {
                msg.innerHTML = `❌ Error (${response.status}): ${errorText}`;
            }
            msg.className = "message error";
        }

    } catch (error) {
        // 4. Handle Network Errors (Server down / CORS / Offline)
        console.error("Login Error:", error);
        msg.innerHTML = "❌ Unable to connect to server. Is the backend running?";
        msg.className = "message error";
    }
}