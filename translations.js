const translations = {
    en: {
        title: "Welcome Back",
        subtitle: "Login to continue chatting",
        user: "Username",
        pass: "Password",
        btn: "Login",
        noAccount: "Don't have an account?",
        signup: "Sign Up"
    },
    hi: {
        title: "स्वागत है",
        subtitle: "चैटिंग जारी रखने के लिए लॉग इन करें",
        user: "उपयोगकर्ता नाम",
        pass: "पासवर्ड",
        btn: "लॉग इन करें",
        noAccount: "खाता नहीं है?",
        signup: "साइन अप करें"
    },
};

function changeLanguage() {
    const lang = document.getElementById("languageSelect").value;
    const t = translations[lang];

    // Update Text Content
    document.getElementById("lblTitle").textContent = t.title;
    document.getElementById("lblSubtitle").textContent = t.subtitle;
    document.getElementById("lblUser").textContent = t.user;
    document.getElementById("lblPass").textContent = t.pass;
    document.getElementById("btnLogin").textContent = t.btn;
    document.getElementById("lblNoAccount").textContent = t.noAccount;
    document.getElementById("lblSignupLink").textContent = t.signup;
}