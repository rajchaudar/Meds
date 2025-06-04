// const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
//     ? "http://localhost:3000/api"
//     : "https://hr-dep-1.onrender.com/api";

//     console.log(`Using API Base URL: ${API_BASE_URL}`);

// // Create message container for smooth UI messages
// const messageContainer = document.createElement("div");
// messageContainer.id = "messageContainer";
// messageContainer.style.position = "fixed";
// messageContainer.style.top = "20px";
// messageContainer.style.left = "50%";
// messageContainer.style.transform = "translateX(-50%)";
// messageContainer.style.padding = "10px 20px";
// messageContainer.style.borderRadius = "5px";
// messageContainer.style.backgroundColor = "#4CAF50";
// messageContainer.style.color = "white";
// messageContainer.style.display = "none";
// messageContainer.style.zIndex = "1000";
// document.body.appendChild(messageContainer);

// function showMessage(message, color = "#4CAF50") {
//     messageContainer.innerText = message;
//     messageContainer.style.backgroundColor = color;
//     messageContainer.style.display = "block";
//     setTimeout(() => {
//         messageContainer.style.opacity = "1";
//         messageContainer.style.transition = "opacity 0.5s ease-in-out";
//     }, 100);
//     setTimeout(() => {
//         messageContainer.style.opacity = "0";
//         setTimeout(() => {
//             messageContainer.style.display = "none";
//         }, 500);
//     }, 3000);
// }

// // 📌 **User Registration**
// document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
//     event.preventDefault();
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     const response = await fetch(`${API_BASE_URL}/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password })
//     });

//     const data = await response.json();
//     showMessage(data.message, data.success ? "#4CAF50" : "#f44336");
//     if (data.success) {
//         setTimeout(() => window.location.href = "login.html", 1500);
//     }
// });

// //Email Login
// document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;

//     try {
//         const response = await fetch(`${API_BASE_URL}/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password })
//         });

//         const data = await response.json();
        
//         // Show the message and display color based on success
//         showMessage(data.message, data.success ? "#4CAF50" : "#f44336");
        
//         // If login is successful, store token and redirect
//         if (data.success) {
//             localStorage.setItem('token', data.token);
//             setTimeout(() => window.location.href = "dashboard.html", 1500);
//         }
//     } catch (error) {
//         console.error("Login error:", error);
//         showMessage("An error occurred. Please try again later.", "#f44336");
//     }
// });

// // 📌 **Google Sign-In**
// async function handleGoogleLogin(response) {
//     const idToken = response.credential;

//     const res = await fetch(`${API_BASE_URL}/auth/google/token`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token: idToken })
//     });

//     const data = await res.json();
//     showMessage(data.message, data.success ? "#4CAF50" : "#f44336");

//     if (data.success) {
//         localStorage.setItem('token', data.token);
//         setTimeout(() => window.location.href = "dashboard.html", 1500);
//     }
// }

// // 📌 **Fetch User Data on Dashboard**
// async function fetchUser() {
//     const token = localStorage.getItem('token');

//     if (!token) {
//         window.location.href = "login.html";
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/dashboard`, {
//             method: "GET",
//             headers: { "Authorization": `Bearer ${token}` }
//         });

//         const data = await response.json();

//         if (data.success) {
//             document.getElementById("username").innerText = data.user.name;
//             document.getElementById("userEmail").innerText = data.user.email;
//         } else {
//             showMessage("Session expired, please log in again.", "#f44336");
//             setTimeout(() => logout(), 1500);
//         }
//     } catch (error) {
//         logout();
//     }
// }

// // 📌 **Request Set Password**
// async function requestSetPassword() {
//     const email = document.getElementById("loginEmail").value.trim();
    
//     if (!email) {
//         showMessage("Please enter your email address.", "#f44336");
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/request-set-password`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email }),
//         });

//         const data = await response.json();
//         showMessage(data.message, data.success ? "#4CAF50" : "#f44336");
//     } catch (error) {
//         showMessage("Something went wrong. Please try again.", "#f44336");
//     }
// }

// // 📌 **Logout Function**
// function logout() {
//     localStorage.removeItem("token");
//     window.location.reload();
// }

// // ✅ Fetch user details when on Dashboard page
// if (window.location.pathname.includes("dashboard.html")) {
//     fetchUser();
// }