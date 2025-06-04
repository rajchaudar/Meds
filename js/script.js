const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// console.log(`Using API Base URL: ${API_BASE_URL}`);

// 📌 **Create Message Container for Smooth UI Feedback**
const messageContainer = document.createElement("div");
messageContainer.id = "messageContainer";
Object.assign(messageContainer.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    borderRadius: "5px",
    backgroundColor: "#4CAF50",
    color: "white",
    display: "none",
    zIndex: "1000",
    opacity: "0",
    transition: "opacity 0.5s ease-in-out",
});
document.body.appendChild(messageContainer);

function showMessage(message, color = "#4CAF50") {
    messageContainer.innerText = message;
    messageContainer.style.backgroundColor = color;
    messageContainer.style.display = "block";
    setTimeout(() => {
        messageContainer.style.opacity = "1";
    }, 100);
    setTimeout(() => {
        messageContainer.style.opacity = "0";
        setTimeout(() => {
            messageContainer.style.display = "none";
        }, 500);
    }, 3000);
}

// 📌 **User Registration**
document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        showMessage(data.message, data.success ? "#4CAF50" : "#f44336");
        if (data.success) {
            setTimeout(() => window.location.href = "login.html", 1500);
        }
    } catch (error) {
        showMessage("Registration failed. Please try again.", "#f44336");
    }
});

// 📌 **Email Login**
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        showMessage(data.message, data.success ? "#4CAF50" : "#f44336");

        if (data.success) {
            localStorage.setItem('token', data.token);
            setTimeout(() => window.location.href = "dashboard.html", 1500);
        }
    } catch (error) {
        showMessage("Login failed. Please try again.", "#f44336");
    }
});

// 📌 **Google Sign-In Handling**
async function handleGoogleLogin(response) {
    const idToken = response.credential;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken })
        });

        const data = await res.json();
        showMessage(data.message, data.success ? "#4CAF50" : "#f44336");

        if (data.success) {
            localStorage.setItem('token', data.token);
            setTimeout(() => window.location.href = "dashboard.html", 1500);
        }
    } catch (error) {
        showMessage("Google authentication failed. Try again later.", "#f44336");
    }
}

function isTokenExpired(token) {
    try {
        const { exp } = jwt_decode(token);
        return Date.now() >= exp * 1000;
    } catch (e) {
        return true; // Treat as expired
    }
}

// 📌 **Fetch User Data on Dashboard**
async function fetchUser() {
    const token = localStorage.getItem('token');
    
    if (!token || isTokenExpired(token)) {
        logout();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById("username").innerText = data.user.name;
            document.getElementById("userEmail").innerText = data.user.email;
        } else {
            showMessage("Session expired. Please log in again.", "#f44336");
            setTimeout(() => logout(), 1500);
        }
    } catch (error) {
        showMessage("Failed to fetch user data.", "#f44336");
        logout();
    }
}

// Toggle Reset Form Visibility
function toggleResetForm() {
    const resetForm = document.getElementById("resetPasswordWrapper");
    resetForm.style.display = resetForm.style.display === "none" ? "block" : "none";
}

// Handle Reset Password Form Submission
document.getElementById("resetPasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.getElementById("resetEmail").value;
    const resetMessage = document.getElementById("resetMessage");
    
    resetMessage.textContent = "Processing...";
    resetMessage.style.color = "blue";
    
    try {
        const response = await fetch(`${API_BASE_URL}/request-set-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (response.ok) {
            resetMessage.textContent = data.message;
            resetMessage.style.color = "green";
        } else {
            throw new Error(data.message || "Something went wrong.");
        }

    } catch (error) {
        resetMessage.textContent = error.message;
        resetMessage.style.color = "red";
    }
});

// 📌 **Logout Function**
function logout() {
    localStorage.removeItem("token");
    window.location.reload();
}

// ✅ **Fetch User Details When on Dashboard Page**
if (window.location.pathname.includes("dashboard.html")) {
    fetchUser();
}

// 📌 **Initialize Google Sign-In**
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "272402842129-j6npr1tvm50n0i2h0o41su9i3089dh1h.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });

    // Attach Google Sign-In button to Login Form
    if (document.querySelector("#googleLoginButton")) {
        google.accounts.id.renderButton(
            document.querySelector("#googleLoginButton"),
            { theme: "outline", size: "large" }
        );
    }

    // Attach Google Sign-In button to Registration Form
    if (document.querySelector("#googleRegisterButton")) {
        google.accounts.id.renderButton(
            document.querySelector("#googleRegisterButton"),
            { theme: "outline", size: "large" }
        );
    }
};