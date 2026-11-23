
/* ==================================================
   FAYNEX - CUSTOMER JAVASCRIPT
================================================== */


/* ==================================================
   1. NOTIFICATIONS
================================================== */

function showNotification(message, title = "Success", type = "success") {

    // Remove any existing notification
    const oldNotification = document.querySelector(
        ".faynex-notification"
    );

    if (oldNotification) {
        oldNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");

    notification.className = "faynex-notification";

    // Error notifications use a red style
    const isError = type === "error";

    if (isError) {
        notification.classList.add("error");
    }

    // Create notification content safely
    const icon = document.createElement("div");
    icon.className = "notification-icon";
    icon.innerHTML = isError
        ? '<i class="fa-solid fa-exclamation"></i>'
        : '<i class="fa-solid fa-check"></i>';

    const content = document.createElement("div");
    content.className = "notification-content";

    const heading = document.createElement("h4");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    content.append(heading, paragraph);

    const closeButton = document.createElement("button");
    closeButton.className = "notification-close";
    closeButton.setAttribute("aria-label", "Close notification");
    closeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    notification.append(icon, content, closeButton);
    document.body.appendChild(notification);

    // Close notification manually
    closeButton.addEventListener("click", function () {
        notification.remove();
    });

    // Automatically close after 3 seconds
    setTimeout(function () {
        notification.remove();
    }, 3000);
}


/* ==================================================
   2. SHOPPING CART
================================================== */

// Get cart products
function getCart() {
    try {
        return JSON.parse(
            localStorage.getItem("faynexCart")
        ) || [];
    } catch (error) {
        return [];
    }
}

// Save cart products

function saveCart(cart) {

    localStorage.setItem(
        "faynexCart",
        JSON.stringify(cart)
    );

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}


// Add a product to the cart
function addToCart(productCard) {

    if (!productCard) return;

    const name = productCard.querySelector("h3")
        ?.textContent.trim();

    const priceText = productCard.querySelector(".price")
        ?.textContent.trim();

    const image = productCard.querySelector(".product-image img")
        ?.getAttribute("src");

    if (!name || !priceText) return;

    const price = parseFloat(
        priceText.replace(/[^0-9.]/g, "")
    );

    if (Number.isNaN(price)) return;

    const cart = getCart();

    // Find the same product in the cart
    const existingProduct = cart.find(function (product) {
        return product.name === name;
    });

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: price,
            image: image || "",
            quantity: 1
        });

    }

    saveCart(cart);

    showNotification(
        name + " added to your cart.",
        "Added to Cart"
    );
}

// Connect only Add to Cart buttons
function initializeCartButtons() {

    document.querySelectorAll(
        ".product-card .cart-btn"
    ).forEach(function (button) {

        // Prevent duplicate event listeners
        if (button.dataset.cartInitialized === "true") return;

        button.dataset.cartInitialized = "true";

        button.addEventListener("click", function () {

            // Products with colors or storage: choose them on the product page
            if (button.dataset.optionsLink) {
                window.location.href = button.dataset.optionsLink;
                return;
            }

            const productCard = button.closest(".product-card");

            addToCart(productCard);

        });

    });
}


/* ==================================================
   3. FAVORITES
================================================== */

// Get favorite products
function getFavorites() {
    try {
        return JSON.parse(
            localStorage.getItem("faynexFavorites")
        ) || [];
    } catch (error) {
        return [];
    }
}

// Save favorite products
function saveFavorites(favorites) {
    localStorage.setItem(
        "faynexFavorites",
        JSON.stringify(favorites)
    );
}

// Update favorite button appearance
function updateFavoriteButton(button, isFavorite) {

    button.classList.toggle("is-favorite", isFavorite);

    button.setAttribute(
        "aria-pressed",
        String(isFavorite)
    );

    button.setAttribute(
        "aria-label",
        isFavorite
            ? "Remove from favorites"
            : "Add to favorites"
    );

    button.textContent = isFavorite ? "❤️" : "♡";
}

// Connect favorite buttons
function initializeFavoriteButtons() {

    document.querySelectorAll(
        ".product-card .favorite-btn"
    ).forEach(function (button) {

        // Prevent duplicate event listeners
        if (button.dataset.favoriteInitialized === "true") return;

        button.dataset.favoriteInitialized = "true";

        const productCard = button.closest(".product-card");

        if (!productCard) return;

        const name = productCard.querySelector("h3")
            ?.textContent.trim();

        if (!name) return;

        // Restore saved favorite state
        const favorites = getFavorites();

        const isFavorite = favorites.some(function (product) {
            return product.name === name;
        });

        updateFavoriteButton(button, isFavorite);

        // Favorite button click
        button.addEventListener("click", function () {

            const currentFavorites = getFavorites();

            const alreadyFavorite = currentFavorites.some(
                function (product) {
                    return product.name === name;
                }
            );

            if (alreadyFavorite) {

                // Remove only from favorites
                const updatedFavorites = currentFavorites.filter(
                    function (product) {
                        return product.name !== name;
                    }
                );

                saveFavorites(updatedFavorites);

                updateFavoriteButton(button, false);

                showNotification(
                    name + " removed from favorites.",
                    "Removed from Favorites"
                );

            } else {

                // Read product information
                const priceText = productCard.querySelector(".price")
                    ?.textContent.trim();

                const image = productCard.querySelector(
                    ".product-image img"
                )?.getAttribute("src");

                const price = parseFloat(
                    (priceText || "").replace(/[^0-9.]/g, "")
                );

                // Add only to favorites
                currentFavorites.push({
                    name: name,
                    price: Number.isNaN(price) ? 0 : price,
                    image: image || ""
                });

                saveFavorites(currentFavorites);

                updateFavoriteButton(button, true);

                showNotification(
                    name + " added to favorites.",
                    "Added to Favorites"
                );

            }

        });

    });
}


/* ==================================================
   4. INITIALIZE CUSTOMER PAGE FUNCTIONS
================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initializeCartButtons();
    initializeFavoriteButtons();
    initializeSearch();
    initializeMobileMenu();
});



/* ==============================
   5. NAVBAR SEARCH
============================== */

function initializeSearch() {
    const searchContainers = document.querySelectorAll(".search-container");

    searchContainers.forEach(function (container) {
        const toggleButton = container.querySelector(".search-toggle");
        const searchForm = container.querySelector(".search-form");
        const searchInput = container.querySelector('input[name="search"]');

        if (!toggleButton || !searchForm || !searchInput) {
            return;
        }

        toggleButton.addEventListener("click", function () {
            const isOpening = searchForm.hidden;

            searchForm.hidden = !isOpening;
            toggleButton.setAttribute("aria-expanded", String(isOpening));

            if (isOpening) {
                searchInput.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (!container.contains(event.target)) {
                searchForm.hidden = true;
                toggleButton.setAttribute("aria-expanded", "false");
            }
        });

        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                searchForm.hidden = true;
                toggleButton.setAttribute("aria-expanded", "false");
                toggleButton.focus();
            }
        });
    });
}


/* ==============================
   6. MOBILE MENU
============================== */

function initializeMobileMenu() {
    const navbar = document.querySelector(".navbar");

    if (!navbar) {
        return;
    }

    const menuToggle = navbar.querySelector(".menu-toggle");
    const navLinks = navbar.querySelector(".nav-links");

    if (!menuToggle || !navLinks) {
        return;
    }

    // Open or close the menu
    function setMenuState(isOpen) {
        navLinks.classList.toggle("open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));

        const icon = menuToggle.querySelector("i");

        if (icon) {
            icon.classList.toggle("fa-bars", !isOpen);
            icon.classList.toggle("fa-xmark", isOpen);
        }
    }

    menuToggle.addEventListener("click", function () {
        setMenuState(!navLinks.classList.contains("open"));
    });

    // Close the menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            setMenuState(false);
        });
    });

    // Close the menu when clicking outside the navbar
    document.addEventListener("click", function (event) {
        if (!navbar.contains(event.target)) {
            setMenuState(false);
        }
    });

    // Close the menu with the Escape key
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });

    // Reset the menu when returning to a large screen
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            setMenuState(false);
        }
    });
}


/* ==============================
   NEWSLETTER SUBSCRIPTION
============================== */


function initializeNewsletter() {
    const emailInput = document.getElementById("newsletter-email");
    const subscribeButton = document.getElementById("newsletter-subscribe");

    if (!emailInput || !subscribeButton) {
        return;
    }

    subscribeButton.addEventListener("click", function () {
        const email = emailInput.value.trim();

        if (!email) {
            showNotification(
                "Please enter your email address.",
                "Email Required"
            );

            emailInput.focus();
            return;
        }

        if (!emailInput.checkValidity()) {
            showNotification(
                "Please enter a valid email address.",
                "Invalid Email"
            );

            emailInput.focus();
            return;
        }

        // Save the subscriber (demo: saved in this browser only)
        let subscribers = [];

        try {
            subscribers = JSON.parse(localStorage.getItem("faynexSubscribers") || "[]");
        } catch (error) {
            subscribers = [];
        }

        if (!Array.isArray(subscribers)) {
            subscribers = [];
        }

        const normalizedEmail = email.toLowerCase();

        if (subscribers.some(subscriber => subscriber.email === normalizedEmail)) {
            showNotification(
                "This email is already subscribed to our newsletter.",
                "Already Subscribed",
                "error"
            );

            return;
        }

        subscribers.push({
            email: normalizedEmail,
            date: new Date().toISOString()
        });

        localStorage.setItem("faynexSubscribers", JSON.stringify(subscribers));

        showNotification(
            "Thank you for subscribing to FAYNEX!",
            "Subscription Successful"
        );

        emailInput.value = "";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initializeNewsletter();
});


/* ==============================
   NAVBAR CART COUNT
============================== */

function updateCartCount() {

    const cartCountElements = document.querySelectorAll(".cart-count");

    const cart = getCart();

    const totalQuantity = cart.reduce((sum, product) => {
        return sum + (Number(product.quantity) || 0);
    }, 0);

    cartCountElements.forEach(element => {
        element.textContent = totalQuantity;
    });
}

document.addEventListener("DOMContentLoaded", updateCartCount);


/* ==============================
   7. USER ACCOUNT
============================== */

// Note: accounts are saved in this browser only (demo).
// A real store needs a Backend for accounts and passwords.

// Get all registered users
function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem("faynexUsers") || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

// Save all registered users
function saveUsers(users) {
    localStorage.setItem("faynexUsers", JSON.stringify(users));
}

// Find a user by email (not case sensitive)
function findUserByEmail(email) {
    const searchEmail = String(email).trim().toLowerCase();

    return getUsers().find(function (user) {
        return user.email === searchEmail;
    });
}

// Get the logged in user
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("faynexCurrentUser") || "null");
    } catch (error) {
        return null;
    }
}

// Save the logged in user (without the password)
function setCurrentUser(user) {
    const currentUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
    };

    localStorage.setItem("faynexCurrentUser", JSON.stringify(currentUser));
}

// Log the user out
function logoutUser() {
    localStorage.removeItem("faynexCurrentUser");
}

// Get all saved orders
function getAllOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem("faynexOrders") || "[]");
        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        return [];
    }
}

// Get the orders of one user (by user id or email)
function getUserOrders(user) {
    if (!user) {
        return [];
    }

    return getAllOrders().filter(function (order) {
        const orderEmail = String(order.customer?.email || "").toLowerCase();

        return order.userId === user.id || orderEmail === user.email;
    });
}

// Turn a password into a SHA-256 hash, so it is not saved as plain text
async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
        .map(function (byte) {
            return byte.toString(16).padStart(2, "0");
        })
        .join("");
}

// Send the navbar account icon to Profile when logged in
function updateAccountLink() {
    if (!getCurrentUser()) {
        return;
    }

    const accountLinks = document.querySelectorAll(
        '.nav-icons a[aria-label="My Account"]'
    );

    accountLinks.forEach(function (link) {
        link.href = link.getAttribute("href").replace("login.html", "profile.html");
    });
}

document.addEventListener("DOMContentLoaded", updateAccountLink);


/* ==============================
   8. STORE SETTINGS
   Saved from the dashboard Settings page
============================== */

const DEFAULT_STORE_SETTINGS = {
    storeName: "FAYNEX",
    storeEmail: "info@faynex.com",
    storePhone: "+962 7XX XXX XXX",
    storeAddress: "Amman, Jordan",
    storeWebsite: "www.faynex.com"
};

function getStoreSettings() {
    try {
        return {
            ...DEFAULT_STORE_SETTINGS,
            ...JSON.parse(localStorage.getItem("faynexSettings") || "{}")
        };
    } catch (error) {
        return { ...DEFAULT_STORE_SETTINGS };
    }
}

// Show the saved contact details in the footer
function applyStoreSettings() {

    const settings = getStoreSettings();

    document.querySelectorAll(".footer p").forEach(function (paragraph) {

        const text = paragraph.textContent.trim();

        if (text.startsWith("Email:")) {
            paragraph.textContent = "Email: " + settings.storeEmail;
        } else if (text.startsWith("Phone:")) {
            paragraph.textContent = "Phone: " + settings.storePhone;
        } else if (text === DEFAULT_STORE_SETTINGS.storeAddress) {
            paragraph.textContent = settings.storeAddress;
        }
    });

    // Any element with data-store-setting="storeEmail" (e.g. Contact page)
    document.querySelectorAll("[data-store-setting]").forEach(function (element) {
        const value = settings[element.dataset.storeSetting];

        if (value) {
            element.textContent = value;
        }
    });
}

document.addEventListener("DOMContentLoaded", applyStoreSettings);


/* ==============================
   9. CURRENCY (Jordanian Dinar)
   One place for price formatting in the whole store
============================== */

const STORE_CURRENCY = "JOD";

// Jordan general sales tax (16%), used by Cart and Checkout
const STORE_TAX_RATE = 0.16;

// formatCurrency(1099) -> "JOD 1,099.00"
// formatCurrency(1099, 0) -> "JOD 1,099"
function formatCurrency(value, decimals = 2) {
    const amount = Number(String(value ?? 0).replace(/[^0-9.-]/g, "")) || 0;

    return STORE_CURRENCY + " " + amount.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
