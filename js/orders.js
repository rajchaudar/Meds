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

// Fetch Orders & Match with Products
async function fetchOrders() {
    const token = localStorage.getItem("token");

    if (!token) {
        const toast = document.getElementById("toast");
        toast.classList.remove("hidden");
    
        setTimeout(() => {
            toast.classList.add("hidden");
            window.location.href = "login.html";
        }, 2000); // show message for 2 seconds
        return;
    }

    try {
        // ✅ Fetch Orders
        const ordersResponse = await fetch(`${API_BASE_URL}/cart/orders`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const ordersData = await ordersResponse.json();
        if (!ordersData.success) throw new Error(ordersData.error || "Failed to fetch orders.");

        // ✅ Fetch Products
        const productsResponse = await fetch(`${API_BASE_URL}/products/store`);
        const productsData = await productsResponse.json();
        if (!productsData.success) throw new Error("Failed to fetch products.");

        const products = productsData.products; // Store products list

        const ordersContainer = document.getElementById("orders-container");
        ordersContainer.innerHTML = "";

        if (ordersData.orders.length === 0) {
            ordersContainer.innerHTML = `<div class="text-center text-gray-600">No orders found.</div>`;
            return;
        }

        // ✅ Populate Orders
        ordersData.orders.forEach(order => {
            const orderElement = document.createElement("div");
            orderElement.className = "border rounded-lg p-4 shadow-md bg-gray-50";

            orderElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <p class="text-lg font-semibold text-blue-600">Order #${order._id}</p>
                    <span class="px-3 py-1 rounded-full text-white ${
                        order.status === "Delivered" ? "bg-green-500" :
                        order.status === "Pending" ? "bg-yellow-500" :
                        order.status === "Paid" ? "bg-blue-500" :
                        order.status === "Shipping" ? "bg-orange-500" :
                        "bg-gray-500"
                    }">${order.status}</span>
                </div>
                <p class="text-gray-700">Total: <span class="font-medium">₹${order.totalAmount.toFixed(2)}</span></p>
                <p class="text-gray-700">Placed on: <span class="font-medium">${new Date(order.createdAt).toLocaleString()}</span></p>
                
                <!-- Ordered Items -->
                <div class="mt-2">
                    <h3 class="font-semibold text-gray-800">Items:</h3>
                    <ul class="space-y-2">
                    ${order.items.map(item => {
                        // Find matching product by ID
                        const product = products.find(p => p._id === item.productId);
                        const productImage = product?.image || "../public/MedicineA.png"; // Default if no image found

                        return `
                            <li class="flex items-center space-x-4 p-2 bg-white rounded-md shadow">
                                <img src="${productImage}" 
                                     alt="${product?.name || 'Product'}" 
                                     class="w-12 h-12 object-cover rounded-md border border-gray-300">
                                <div>
                                    <p class="font-medium">${product?.name || "Unknown Product"}</p>
                                    <p class="text-gray-600">Quantity: ${item.quantity} x $${item.price.toFixed(2)}</p>
                                </div>
                            </li>
                        `;
                    }).join("")}
                    </ul>
                </div>
            `;

            ordersContainer.appendChild(orderElement);
        });

    } catch (error) {
        console.error("❌ Fetch Orders Error:", error);
        document.getElementById("error-message").classList.remove("hidden");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount()
    fetchUserDetails();
    fetchOrders();

});