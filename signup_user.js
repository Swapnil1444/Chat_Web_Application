// function signupUser() {
//     let user = document.getElementById("signupUser").value;
//     let email = document.getElementById("signupEmail").value;
//     let phone = document.getElementById("signupPhone").value;
//     let pass = document.getElementById("signupPass").value;
//     let confirmPass = document.getElementById("signupConfirmPass").value;
//     let msg = document.getElementById("signupMsg");

//     // Validation
//     if (user === "") {
//         msg.innerHTML = "❌ Please enter username";
//         msg.className = "message error";
//         return;
//     }

//     if (email === "") {
//         msg.innerHTML = "❌ Please enter email";
//         msg.className = "message error";
//         return;
//     }

//     if (!email.includes("@")) {
//         msg.innerHTML = "❌ Please enter valid email";
//         msg.className = "message error";
//         return;
//     }

//     if (phone === "") {
//         msg.innerHTML = "❌ Please enter phone number";
//         msg.className = "message error";
//         return;
//     }

//     // Validate phone number format (only digits, 10-15 digits)
//     let phoneRegex = /^[0-9]{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//         msg.innerHTML = "❌ Phone number must contain only digits and be 10-15 digits long";
//         msg.className = "message error";
//         return;
//     }

//     if (pass === "") {
//         msg.innerHTML = "❌ Please enter password";
//         msg.className = "message error";
//         return;
//     }

//     if (pass.length < 6) {
//         msg.innerHTML = "❌ Password must be at least 6 characters";
//         msg.className = "message error";
//         return;
//     }

//     if (pass !== confirmPass) {
//         msg.innerHTML = "❌ Passwords do not match";
//         msg.className = "message error";
//         return;
//     }

//     // If all validations pass
//     msg.innerHTML = "🎉 Sign up successful! Welcome " + user + "!";
//     msg.className = "message";

//     // Clear form fields
//     document.getElementById("signupUser").value = "";
//     document.getElementById("signupEmail").value = "";
//     document.getElementById("signupPhone").value = "";
//     document.getElementById("signupPass").value = "";
//     document.getElementById("signupConfirmPass").value = "";
// }


async function signupUser() {
    let user = document.getElementById("signupUser").value;
    let email = document.getElementById("signupEmail").value;
    let phone = document.getElementById("signupPhone").value;
    let pass = document.getElementById("signupPass").value;
    let confirmPass = document.getElementById("signupConfirmPass").value;
    let msg = document.getElementById("signupMsg");

    // Validation
    if (user === "") {
        msg.innerHTML = "❌ Please enter username";
        msg.className = "message error";
        return;
    }

    if (email === "") {
        msg.innerHTML = "❌ Please enter email";
        msg.className = "message error";
        return;
    }

    if (!email.includes("@")) {
        msg.innerHTML = "❌ Please enter valid email";
        msg.className = "message error";
        return;
    }

    if (phone === "") {
        msg.innerHTML = "❌ Please enter phone number";
        msg.className = "message error";
        return;
    }

    let phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
        msg.innerHTML = "❌ Phone number must contain only digits and be 10-15 digits long";
        msg.className = "message error";
        return;
    }

    if (pass === "") {
        msg.innerHTML = "❌ Please enter password";
        msg.className = "message error";
        return;
    }

    if (pass.length < 6) {
        msg.innerHTML = "❌ Password must be at least 6 characters";
        msg.className = "message error";
        return;
    }

    if (pass !== confirmPass) {
        msg.innerHTML = "❌ Passwords do not match";
        msg.className = "message error";
        return;
    }

    // Call Spring Boot API
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

        if (response.ok) {
            let data = await response.json();
            msg.innerHTML = "🎉 Sign up successful! Welcome " + data.userName + "!";
            msg.className = "message";

            // Clear form fields
            document.getElementById("signupUser").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPhone").value = "";
            document.getElementById("signupPass").value = "";
            document.getElementById("signupConfirmPass").value = "";

            // Optionally redirect to login
            setTimeout(() => {
                window.location.href = "Login.html";
            }, 2000);
        } else {
            msg.innerHTML = "❌ Signup failed. Try again.";
            msg.className = "message error";
        }
    } catch (error) {
        console.error("Error:", error);
        msg.innerHTML = "❌ Network error. Backend not reachable.";
        msg.className = "message error";
    }
}