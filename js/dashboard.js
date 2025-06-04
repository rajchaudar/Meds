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

async function fetchMarketedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/marketed`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const container = document.getElementById("marketedProducts");
        if (!container) return;

        container.innerHTML = "";

        // Detect if the current page is "dashboard.html"
        const isDashboard = window.location.pathname.includes("dashboard");

        if (data.success && data.products.length > 0) {
            data.products.forEach((product, index) => {
                if (isDashboard && index >= 6) return; // Show only 6 on dashboard

                const productCard = document.createElement("div");
                productCard.className = "relative group cursor-pointer overflow-hidden rounded-lg shadow-lg bg-white";

                productCard.innerHTML = `
                    <img src="${product.image}" class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" alt="${product.name}">
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                        <h3 class="text-xl text-white font-bold text-center">${product.name}</h3>
                        <p class="text-white text-sm text-center">
                        ${product.description ? product.description : (product.description ?  "..." : "Information not available")}</p>
                        <button onclick="showModal(
                        '${encodeURIComponent(product.name)}', 
                        '${encodeURIComponent(product.description)}', 
                        '${product.image}', 
                        '${encodeURIComponent(product.uses || "Not Available")}', 
                        '${encodeURIComponent(product.content || "Not Available")}', 
                        '${encodeURIComponent(product.manufacturer || "Not Available")}', 
                        '${product.price}')"class="mt-3 bg-white text-black px-4 py-2 rounded hover:bg-blue-300">
                        See More</button>
                        </div>`;
                container.appendChild(productCard);
            });
        } else {
            container.innerHTML = `<p class="text-center text-gray-500">No products available.</p>`;
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById("marketedProducts").innerHTML = `<p class="text-center text-red-500">Failed to load products. Please try again later.</p>`;
    }
}

// Function to Show Modal with Product Details
function showModal(name, description, image, uses, content, manufacturer, price) {
    // Get the modal and content elements
    const modal = document.getElementById("productModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalImage = document.getElementById("modalImage");
    const modalDescription = document.getElementById("modalDescription");
    const modalUses = document.getElementById("modalUses");
    const modalContent = document.getElementById("modalContent");
    const modalManufacturer = document.getElementById("modalManufacturer");
    const modalPrice = document.getElementById("modalPrice");

    // Update the modal content
    modalTitle.textContent = decodeURIComponent(name);
    modalImage.src = image;
    modalImage.alt = decodeURIComponent(name);
    modalDescription.textContent = decodeURIComponent(description) || "No description available.";
    modalUses.textContent = `Uses: ${decodeURIComponent(uses) || "..."}`;
    modalContent.textContent = `Content: ${decodeURIComponent(content) || "Not available"}`;
    modalManufacturer.textContent = `Manufacturer: ${decodeURIComponent(manufacturer) || "Unknown"}`;
    modalPrice.textContent = `Price: ₹${price}`;

    // Show the modal
    modal.classList.remove("hidden");
}

// Function to close the modal
function closeModal() {
    document.getElementById("productModal").classList.add("hidden");
}

// Function to close the modal
function closeModal() {
    document.getElementById("productModal").classList.add("hidden");
}

// // ✅ Fetch Store Products (Products available for purchase)
// async function fetchStoreProducts() {
//     const productsContainer = document.getElementById("storeProducts");
//     if (!productsContainer) {
//         console.error("storeProducts container is missing in the HTML.");
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/products/store`);
//         if (!response.ok) throw new Error("Failed to fetch store products");
        
//         const data = await response.json();
//         productsContainer.innerHTML = "";

//         if (!data.success || !data.products.length) {
//             productsContainer.innerHTML = "<p class='text-gray-600'>No store products available.</p>";
//             return;
//         }

//         data.products.forEach(product => {
//             const productItem = `
//                 <div class="product bg-white shadow-md p-4 rounded">
//                     <h3 class="text-lg font-bold">${product.name}</h3>
//                     <p>${product.description || "No description available."}</p>
//                     <p class="text-gray-700 font-semibold">Price: ₹${product.price}</p>
//                     <button class="bg-blue-500 text-white px-4 py-2 rounded mt-2" 
//                         onclick="addToCart('${product.name}', ${product.price})">
//                         Add to Cart
//                     </button>
//                 </div>
//             `;
//             productsContainer.innerHTML += productItem;
//         });
//     } catch (error) {
//         console.error("Error fetching store products:", error);
//         productsContainer.innerHTML = "<p class='text-red-500'>Failed to load store products.</p>";
//     }
// }

// // Function to add a product to the cart
// function addToCart(productName, price) {
//     alert(`Added ${productName} to cart for ₹${price}`);
// }

// // Function to update cart count
// function updateCartCount() {
//     let cart = JSON.parse(localStorage.getItem("cart")) || [];
//     document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
// }

// Call function whenever cart updates
// document.addEventListener("DOMContentLoaded", updateCartCount);

// ✅ Logout function
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// ✅ Utility to show error
function showError(message) {
    const errorEl = document.getElementById("errorMessage");
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
    }
}

// ✅ Fetch data when page loads
document.addEventListener("DOMContentLoaded", function () {
    fetchUserDetails?.();
    fetchMarketedProducts?.();
    // fetchStoreProducts?.(); // Optional
});

// ✅ Contact form logic
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");

    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitButton = e.target.querySelector("button");

        // Reset messages
        successMessage.classList.add("hidden");
        errorMessage.classList.add("hidden");
        errorMessage.textContent = "";

        // UI: show loading
        submitButton.disabled = true;
        btnText.textContent = "Sending...";
        spinner.classList.remove("hidden");

        const formData = {
            name: document.getElementById("name")?.value.trim(),
            email: document.getElementById("email")?.value.trim(),
            message: document.getElementById("message")?.value.trim()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Success UI
                successMessage.classList.remove("hidden");

                // Wait before reset so spinner/message is visible
                await new Promise(resolve => setTimeout(resolve, 700));

                contactForm.reset();

                // Auto-hide success after 3 sec
                setTimeout(() => {
                    successMessage.classList.add("hidden");
                }, 3000);
            } else {
                errorMessage.textContent = "Failed to send message. Please try again.";
                errorMessage.classList.remove("hidden");
            }
        } catch (err) {
            console.error("Form Error:", err);
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.classList.remove("hidden");
        } finally {
            submitButton.disabled = false;
            btnText.textContent = "Send Message";
            spinner.classList.add("hidden");
        }
    });
});