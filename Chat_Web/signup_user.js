async function signupUser() {
    // 1. Get and Clean Inputs (Trim spaces)
    let user = document.getElementById("signupUser").value.trim();
    let email = document.getElementById("signupEmail").value.trim();
    let phone = document.getElementById("signupPhone").value.trim();
    let pass = document.getElementById("signupPass").value.trim();
    let confirmPass = document.getElementById("signupConfirmPass").value.trim();
    let msg = document.getElementById("signupMsg");

    // 2. Client-Side Validation
    if (user === "") {
        showError(msg, "❌ Please enter a username");
        return;
    }

    if (email === "" || !email.includes("@")) {
        showError(msg, "❌ Please enter a valid email");
        return;
    }

    if (phone === "") {
        showError(msg, "❌ Please enter a phone number");
        return;
    }

    let phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
        showError(msg, "❌ Phone must be 10-15 digits (numbers only)");
        return;
    }

    if (pass === "") {
        showError(msg, "❌ Please enter a password");
        return;
    }

    if (pass.length < 6) {
        showError(msg, "❌ Password must be at least 6 characters");
        return;
    }

    if (pass !== confirmPass) {
        showError(msg, "❌ Passwords do not match");
        return;
    }

    // 3. Show Loading State
    msg.innerHTML = "⏳ Registering...";
    msg.className = "message";

    // 4. Call Spring Boot API
    try {
        let response = await fetch("http://localhost:8082/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: user,
                password: pass,
                phoneNumber: phone,
                email: email
            })
        });

        // 5. Handle Response
        if (response.ok) {
            let data = await response.json();
            
            msg.innerHTML = "🎉 Sign up successful! Welcome, " + (data.userName || user) + "!";
            msg.className = "message success"; // Make sure you have .success in CSS

            // Clear form fields
            document.getElementById("signupUser").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPhone").value = "";
            document.getElementById("signupPass").value = "";
            document.getElementById("signupConfirmPass").value = "";

            // Redirect to Login Page
            setTimeout(() => {
                window.location.href = "Login.html";
            }, 2000);

        } else {
            // Handle HTTP Errors
            let errorText = "Signup failed";
            try {
                let errorData = await response.json();
                errorText = errorData.message || errorData.error || "Signup failed";
            } catch (e) {
                errorText = response.statusText;
            }

            if (response.status === 409) {
                // 409 Conflict usually means User/Email already exists
                showError(msg, "❌ User or Email already exists!");
            } else if (response.status === 400) {
                showError(msg, "❌ Invalid data provided.");
            } else if (response.status === 500) {
                showError(msg, "❌ Server error. Please try again later.");
            } else {
                showError(msg, `❌ Error (${response.status}): ${errorText}`);
            }
        }
    } catch (error) {
        // 6. Handle Network Errors
        console.error("Signup Error:", error);
        showError(msg, "❌ Unable to connect to server. Is the backend running?");
    }
}

// Helper function to keep code clean
function showError(element, message) {
    element.innerHTML = message;
    element.className = "message error";
}