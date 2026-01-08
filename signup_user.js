function signupUser() {
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

    if (phone.length < 10) {
        msg.innerHTML = "❌ Phone number must be at least 10 digits";
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

    // If all validations pass
    msg.innerHTML = "🎉 Sign up successful! Welcome " + user + "!";
    msg.className = "message";

    // Clear form fields
    document.getElementById("signupUser").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPhone").value = "";
    document.getElementById("signupPass").value = "";
    document.getElementById("signupConfirmPass").value = "";
}
