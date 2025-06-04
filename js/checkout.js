// ✅ Get User ID from JWT Token
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("checkout-btn").addEventListener("click", startCheckout);
});
// ✅ Initialize Checkout
document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.getElementById("checkout-form");
    const paymentForm = document.getElementById("payment-form");
    const checkoutBtn = document.getElementById("checkout-btn");
    const payBtn = document.getElementById("pay-btn");
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to proceed.");
        window.location.href = "login.html";
        return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
        alert("Invalid session. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    if (checkoutForm) checkoutForm.addEventListener("submit", (event) => startCheckout(event, checkoutBtn, payBtn));
    if (paymentForm) paymentForm.addEventListener("submit", processPayment);
});

// ✅ Start Checkout (Disable Button Immediately)
// async function startCheckout(event, checkoutBtn, payBtn) {
//     event.preventDefault();

//     const token = localStorage.getItem("token");
//     if (!token) return;
//     const userId = getUserIdFromToken(token);
//     if (!userId) return;

//     try {
//         // 🔹 Disable "Proceed to Payment" Button
//         checkoutBtn.textContent = "Processing...";
//         checkoutBtn.disabled = true;
//         checkoutBtn.setAttribute("disabled", true);
//         checkoutBtn.classList.add("opacity-50", "cursor-not-allowed");

//         const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({
//                 userId,
//                 name: document.getElementById("name").value,
//                 email: document.getElementById("email").value,
//                 contact: document.getElementById("contact").value,
//                 address: {
//                     line1: document.getElementById("addressLine1").value,
//                     city: document.getElementById("city").value,
//                     state: document.getElementById("state").value,
//                     postal_code: document.getElementById("postalCode").value,
//                 }
//             })
//         });

//         const result = await response.json();
//         if (!response.ok) throw new Error(result.error || "Checkout failed.");

//         clientSecret = result.clientSecret;
//         orderId = result.orderId;
//         document.getElementById("payment-section").classList.remove("hidden");

//         const elements = stripe.elements();
//         card = elements.create("card");
//         card.mount("#card-element");

//         // 🔹 Enable "Pay Now" Button
//         payBtn.disabled = false;
//         payBtn.classList.remove("bg-gray-400", "cursor-not-allowed");
//         payBtn.classList.add("bg-blue-500", "hover:bg-blue-700");

//     } catch (error) {
//         console.error("❌ Error:", error);
//         alert(error.message || "Failed to start checkout.");

//         // 🔹 Re-enable "Proceed to Payment" on failure
//         checkoutBtn.textContent = "Proceed to Payment";
//         checkoutBtn.disabled = false;
//         checkoutBtn.removeAttribute("disabled");
//         checkoutBtn.classList.remove("opacity-50", "cursor-not-allowed");
//     }
// }

// // ✅ Process Payment using Stripe
// async function processPayment(event) {
//     event.preventDefault();

//     if (!clientSecret) {
//         alert("Payment session not initialized. Please retry checkout.");
//         return;
//     }

//     if (!card) {
//         alert("Payment form is not ready. Refresh and try again.");
//         return;
//     }

//     try {
//         const payBtn = document.getElementById("pay-btn");
//         payBtn.textContent = "Processing...";
//         payBtn.disabled = true;

//         const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
//             payment_method: { card },
//             receipt_email: document.getElementById("email").value
//         });

//         if (error) {
//             alert("❌ Payment failed: " + error.message);
//             payBtn.textContent = "Pay Now";
//             payBtn.disabled = false;
//             return;
//         }

//         await updateOrderStatus();
//     } catch (error) {
//         console.error("❌ Payment Error:", error);
//         alert("❌ Payment processing failed. Try again.");
//     }
// }

// // ✅ Update Order Status & Clear Cart
// async function updateOrderStatus() {
//     try {
//         await fetch(`${API_BASE_URL}/cart/orderstatus/${orderId}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${localStorage.getItem("token")}`
//             },
//             body: JSON.stringify({ status: "Paid" })
//         });
//         await clearCart();

//         document.getElementById("success-message").classList.remove("hidden");
//         setTimeout(() => window.location.href = "order-success.html", 3000);
//     } catch (error) {
//         console.error("❌ Order Update Error:", error);
//     }
// }

async function startCheckout(event) {
    event.preventDefault();

    const checkoutBtn = document.getElementById("checkout-btn");
    if (!checkoutBtn) {
        console.error("Checkout button not found.");
        return;
    }

    if (typeof Razorpay === "undefined") {
        console.error("❌ Razorpay is not loaded.");
        alert("Payment gateway is not available. Please refresh the page.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const userId = getUserIdFromToken(token);
    if (!userId) return;

    try {
        checkoutBtn.textContent = "Processing...";
        checkoutBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                userId,
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                contact: document.getElementById("contact").value,
                address: {
                    line1: document.getElementById("addressLine1").value,
                    city: document.getElementById("city").value,
                    state: document.getElementById("state").value,
                    postal_code: document.getElementById("postalCode").value,
                }
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Checkout failed.");

        const { orderId, amount, key } = result;

        var options = {
            key: key,
            amount: amount,
            currency: "INR",
            name: "MedSupply",
            description: "Purchase from MedSupply",
            order_id: orderId,
            handler: async function (response) {
                await updateOrderStatus(orderId, response.razorpay_payment_id);
            },
            prefill: {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                contact: document.getElementById("contact").value,
            },
            theme: { color: "#3399cc" },
        };

        var rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error("❌ Checkout Error:", error);
        alert(error.message || "Failed to start checkout.");
        checkoutBtn.textContent = "Proceed to Payment";
        checkoutBtn.disabled = false;
    }
}

// ✅ Update Order Status After Payment
async function updateOrderStatus(orderId, paymentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/orderstatus/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ status: "Paid", paymentId })
        });

        const result = await response.json();
        console.log("📝 Order Update Response:", result);

        if (!response.ok) {
            console.error("❌ Failed to update order:", result);
            alert("Order update failed: " + result.error);
            return;
        }

        await clearCart();

        document.getElementById("success-message").classList.remove("hidden");
        setTimeout(() => window.location.href = "order-success.html", 3000);
    } catch (error) {
        console.error("❌ Order Update Error:", error);
    }
}

// ✅ Clear User Cart After Successful Payment
async function clearCart() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await fetch(`${API_BASE_URL}/cart/clear`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
    } catch (error) {
        console.error("❌ Cart Clear Error:", error);
    }
}
