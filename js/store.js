    // Function to fetch user details and update the UI
async function fetchUserDetails() {
    const token = localStorage.getItem("token");
    
    // Ensure elements exist before manipulating them
    const loginRegisterLink = document.getElementById("loginRegisterLink");
    const logoutLink = document.getElementById("logoutLink");
    const userName = document.getElementById("userName");

    if (!loginRegisterLink || !logoutLink || !userName) {
        console.error("One or more authentication elements are missing in the HTML.");
        return;
    }

    if (!token) {
        loginRegisterLink.classList.remove("hidden");
        logoutLink.classList.add("hidden");
        userName.textContent = "Guest";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Invalid response");
        }

        const data = await response.json();
        if (data.success) {
            loginRegisterLink.classList.add("hidden");
            logoutLink.classList.remove("hidden");
            userName.textContent = data.user.name;
        } else {
            loginRegisterLink.classList.remove("hidden");
            logoutLink.classList.add("hidden");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        loginRegisterLink.classList.remove("hidden");
        logoutLink.classList.add("hidden");
    }
}

// Logout function
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// ✅ Fetch Store Products from Backend
async function fetchStoreProducts() {
    const productsContainer = document.getElementById("storeProducts");
    if (!productsContainer) return console.error("❌ storeProducts container not found.");

    try {
        const response = await fetch(`${API_BASE_URL}/products/store`);
        const data = await response.json();

        productsContainer.innerHTML = ""; // Clear previous content

        if (data.success && data.products.length > 0) {
            data.products.forEach(product => {
                const productItem = `
                    <div class="bg-white shadow-md p-4 rounded-lg">
                        <img src="${product.image}" class="w-full h-40 object-cover rounded-md mb-3" alt="${product.name}">
                        <h3 class="text-lg font-bold">${product.name}</h3>
                        <p class="text-gray-700">${product.description}</p>
                        <p class="font-semibold text-blue-600 mt-2">Price: ₹${product.price}</p>
                        <button class="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="addToCart('${product._id}')">
                            Add to Cart
                        </button>
                    </div>`;
                productsContainer.innerHTML += productItem;
            });
        } else {
            productsContainer.innerHTML = "<p class='text-gray-600 text-center'>No products available.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching store products:", error);
        productsContainer.innerHTML = "<p class='text-red-500 text-center'>Failed to load products.</p>";
    }
}

// ✅ Add Product to Cart
async function addToCart(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
        // Show the first toast message and store the toast element
        const toast1 = showToast("⚠️ Please log in to add items!", "bg-red-600");
    
        // After a certain delay, show the second toast and clear the first one
        setTimeout(() => {
            toast1.remove(); // Remove the first toast
            showToast("Redirecting to login..", "bg-green-600"); // Show second toast
    
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = "login.html";
            }, 700); 
        }, 2000); // Delay the second toast by 2 seconds
    
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!response.ok) {
            throw new Error("Failed to add item to cart.");
        }

        const data = await response.json();
        if (data.success) {
            showToast("🛒 Item added to cart!", "bg-green-600");
            updateCartCount(); // Update cart count
        } else {
            throw new Error(data.message || "Failed to add item.");
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        showToast("❌ Failed to add item! (Check You Need To Log In First)", "bg-red-600");
    }
}


// ✅ Fetch and Update Cart Count in Navbar
async function updateCartCount() {
    const token = localStorage.getItem("token");

    // If no token, show a login prompt and redirect to login page
    if (!token) {
        // showToast("⚠️ Please log in to view your cart!", "bg-red-600");
        // window.location.href = "login.html"; // Redirect to login page
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/count`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Update the cart count in the navbar
        const cartCountElement = document.getElementById("cart-count");
        if (cartCountElement) {
            cartCountElement.innerText = data.count || 0;
        } else {
            console.error("❌ Cart count element not found in DOM!");
        }
    } catch (error) {
        console.error("❌ Error fetching cart count:", error);
    }
}

function showToast(message, bgColor = "bg-green-600") {
    const toast = document.createElement("div");
    toast.className = `fixed top-[70px] left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-2 rounded shadow-md transition-opacity duration-500 opacity-100 z-50`;
    toast.innerText = message;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    return toast;
}

// ✅ Run on Page Load
document.addEventListener("DOMContentLoaded", function () {
    fetchUserDetails();
    fetchStoreProducts();
    updateCartCount();
});