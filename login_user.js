let generatedOTP;

function sendOTP() {
    let phone = document.getElementById("phone").value;
    let msg = document.getElementById("msg");

    if (phone === "") {
        msg.innerHTML = "❌ Please enter phone number";
        msg.className = "message error";
        return;
    }

    // Generate 4-digit OTP
    generatedOTP = Math.floor(1000 + Math.random() * 9000);

    alert("Your OTP is: " + generatedOTP); // Demo purpose

    msg.innerHTML = "✅ OTP sent successfully";
    msg.className = "message";
}

function verifyOTP() {
    let enteredOTP = document.getElementById("otp").value;
    let msg = document.getElementById("msg");

    if (enteredOTP == generatedOTP) {
        msg.innerHTML = "🎉 Login Successful!";
        msg.className = "message";
    } else {
        msg.innerHTML = "❌ Invalid OTP";
        msg.className = "message error";
    }
}
function loginUser() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;
    let msg = document.getElementById("loginMsg");

    // Demo credentials
    if (user === "admin" && pass === "1234") {
        msg.innerHTML = "✅ Login Successful!";
        msg.className = "message";
    } else {
        msg.innerHTML = "❌ Invalid Username or Password";
        msg.className = "message error";
    }
}