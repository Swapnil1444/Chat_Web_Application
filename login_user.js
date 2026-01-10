// let generatedOTP;

// function sendOTP() {
//     let phone = document.getElementById("phone").value;
//     let msg = document.getElementById("msg");

//     if (phone === "") {
//         msg.innerHTML = "❌ Please enter phone number";
//         msg.className = "message error";
//         return;
//     }

//     // Generate 4-digit OTP
//     generatedOTP = Math.floor(1000 + Math.random() * 9000);

//     alert("Your OTP is: " + generatedOTP); // Demo purpose

//     msg.innerHTML = "✅ OTP sent successfully";
//     msg.className = "message";
// }

// function verifyOTP() {
//     let enteredOTP = document.getElementById("otp").value;
//     let msg = document.getElementById("msg");

//     if (enteredOTP == generatedOTP) {
//         msg.innerHTML = "🎉 Login Successful!";
//         msg.className = "message";
//     } else {
//         msg.innerHTML = "❌ Invalid OTP";
//         msg.className = "message error";
//     }
// }
// function loginUser() {
//     let user = document.getElementById("loginUser").value;
//     let pass = document.getElementById("loginPass").value;
//     let msg = document.getElementById("loginMsg");

//     // Demo credentials
//     if (user === "admin" && pass === "1234") {
//         msg.innerHTML = "✅ Login Successful!";
//         msg.className = "message";

//         // Store username and redirect to dashboard
//         localStorage.setItem("username", user);
//         setTimeout(() => {
//             window.location.href = "Dashboard.html";
//         }, 1500);
//     } else {
//         msg.innerHTML = "❌ Invalid Username or Password";
//         msg.className = "message error";
//     }
// }

// login_user.js

async function loginUser() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;
    let msg = document.getElementById("loginMsg");

    if (user === "" || pass === "") {
        msg.innerHTML = "❌ Please enter Username and Password";
        msg.className = "message error";
        return;
    }

    try {
        // Call Spring Boot /user/login API
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

        if (response.ok) {
            let data = await response.json();

            if (data && data.userName) {
                msg.innerHTML = "✅ Login Successful!";
                msg.className = "message";


                // Store username in localStorage
                // After successful login response
                localStorage.setItem("userId", data.id);
                localStorage.setItem("username", data.userName);

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = "Dashboard.html";
                }, 1500);
            } else {
                msg.innerHTML = "❌ Invalid Username or Password";
                msg.className = "message error";
            }
        } else {
            msg.innerHTML = "❌ Server Error";
            msg.className = "message error";
        }
    } catch (error) {
        console.error("Error:", error);
        msg.innerHTML = "❌ Network Error";
        msg.className = "message error";
    }
}