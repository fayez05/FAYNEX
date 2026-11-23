
/* ==============================
   1. PROFILE ELEMENTS
============================== */

const profileFullName = document.getElementById("profile-full-name");

const statOrders = document.getElementById("stat-orders");
const statWishlist = document.getElementById("stat-wishlist");
const statCart = document.getElementById("stat-cart");
const statReviews = document.getElementById("stat-reviews");

const profileDetails = document.getElementById("profile-details");
const infoFirstName = document.getElementById("info-first-name");
const infoLastName = document.getElementById("info-last-name");
const infoEmail = document.getElementById("info-email");
const infoPhone = document.getElementById("info-phone");

const editProfileLink = document.getElementById("edit-profile-link");
const profileEditForm = document.getElementById("profile-edit-form");
const profileCancelButton = document.getElementById("profile-cancel-btn");
const editFirstName = document.getElementById("edit-first-name");
const editLastName = document.getElementById("edit-last-name");
const editEmail = document.getElementById("edit-email");
const editPhone = document.getElementById("edit-phone");

const logoutLink = document.getElementById("logout-link");

const recentOrdersBody = document.getElementById("recent-orders-body");


/* ==============================
   2. CHECK LOGIN
============================== */

const profileUser = getCurrentUser();

// Profile needs a logged in user
if (!profileUser) {
    window.location.replace("login.html");
}


/* ==============================
   3. PROFILE HELPERS
============================== */

// Format prices like the rest of the store
function formatProfilePrice(price) {
    // Shared JOD format from main.js
    return formatCurrency(price);
}

// Format dates like "23 Nov 2026"
function formatProfileDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Get a safe status name for the CSS class
function getProfileStatus(status) {
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const normalizedStatus = String(status || "pending").toLowerCase().trim();

    return allowedStatuses.includes(normalizedStatus) ? normalizedStatus : "pending";
}


/* ==============================
   4. SHOW PROFILE DATA
============================== */

function renderProfile(user) {

    profileFullName.textContent = `${user.firstName} ${user.lastName}`;

    infoFirstName.textContent = user.firstName;
    infoLastName.textContent = user.lastName;
    infoEmail.textContent = user.email;
    infoPhone.textContent = user.phone || "-";

}


/* ==============================
   5. SHOW STATISTICS
============================== */

function renderProfileStats(user) {

    const cartQuantity = getCart().reduce(function (sum, product) {
        return sum + (Number(product.quantity) || 0);
    }, 0);

    statOrders.textContent = getUserOrders(user).length;
    statWishlist.textContent = getFavorites().length;
    statCart.textContent = cartQuantity;

    // Reviews this customer wrote (saved by the Product Details page)
    let reviews = [];

    try {
        reviews = JSON.parse(localStorage.getItem("faynexReviews") || "[]");
    } catch (error) {
        reviews = [];
    }

    statReviews.textContent = Array.isArray(reviews)
        ? reviews.filter(review => review.userId === user.id).length
        : 0;

}


/* ==============================
   6. SHOW RECENT ORDERS
============================== */

function renderRecentOrders(user) {

    const orders = getUserOrders(user)
        .sort(function (a, b) {
            return new Date(b.orderDate) - new Date(a.orderDate);
        })
        .slice(0, 5);

    recentOrdersBody.innerHTML = "";


    /* No Orders */

    if (orders.length === 0) {

        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");

        emptyCell.colSpan = 4;
        emptyCell.className = "empty-recent-orders";
        emptyCell.textContent = "You haven't placed any orders yet.";

        emptyRow.appendChild(emptyCell);
        recentOrdersBody.appendChild(emptyRow);

        return;

    }


    /* Order Rows */

    orders.forEach(function (order) {

        const row = document.createElement("tr");
        const status = getProfileStatus(order.status);

        const cells = [
            { text: "#" + order.orderNumber },
            { text: formatProfileDate(order.orderDate) },
            { text: status.charAt(0).toUpperCase() + status.slice(1), className: status },
            { text: formatProfilePrice(order.total) }
        ];

        cells.forEach(function (cellData) {

            const cell = document.createElement("td");

            cell.textContent = cellData.text;

            if (cellData.className) {
                cell.className = cellData.className;
            }

            row.appendChild(cell);

        });

        recentOrdersBody.appendChild(row);

    });

}


/* ==============================
   7. EDIT PROFILE
============================== */

// Show or hide the edit form
function toggleEditForm(isEditing) {

    profileEditForm.hidden = !isEditing;
    profileDetails.hidden = isEditing;

    if (isEditing) {

        const user = getCurrentUser();

        editFirstName.value = user.firstName;
        editLastName.value = user.lastName;
        editEmail.value = user.email;
        editPhone.value = user.phone || "";

        editFirstName.focus();

    }
}


if (editProfileLink) {

    editProfileLink.addEventListener("click", function () {
        toggleEditForm(true);
    });

}


if (profileCancelButton) {

    profileCancelButton.addEventListener("click", function () {
        toggleEditForm(false);
    });

}


if (profileEditForm) {

    profileEditForm.addEventListener("submit", function (event) {

        event.preventDefault();


        /* Validate Form */

        if (!profileEditForm.checkValidity()) {

            profileEditForm.reportValidity();

            return;

        }


        /* Get New Values */

        const currentUser = getCurrentUser();

        const firstName = editFirstName.value.trim();
        const lastName = editLastName.value.trim();
        const email = editEmail.value.trim().toLowerCase();
        const phone = editPhone.value.trim();

        if (!firstName || !lastName) {

            showNotification(
                "Please enter your first and last name.",
                "Name Required",
                "error"
            );

            return;

        }


        /* Check Email Is Not Used by Another Account */

        const emailOwner = findUserByEmail(email);

        if (emailOwner && emailOwner.id !== currentUser.id) {

            showNotification(
                "This email is already used by another account.",
                "Email Already Registered",
                "error"
            );

            editEmail.focus();

            return;

        }


        /* Update Saved Users */

        const users = getUsers();

        const userIndex = users.findIndex(function (user) {
            return user.id === currentUser.id;
        });

        if (userIndex === -1) {

            showNotification(
                "Your account was not found. Please log in again.",
                "Account Not Found",
                "error"
            );

            return;

        }

        users[userIndex] = {
            ...users[userIndex],
            firstName,
            lastName,
            email,
            phone
        };

        saveUsers(users);


        /* Update Logged In User */

        setCurrentUser(users[userIndex]);


        /* Refresh Page Data */

        const updatedUser = getCurrentUser();

        renderProfile(updatedUser);
        renderProfileStats(updatedUser);
        renderRecentOrders(updatedUser);

        toggleEditForm(false);

        showNotification(
            "Your profile has been updated.",
            "Profile Updated"
        );

    });

}


/* ==============================
   8. LOGOUT
============================== */

if (logoutLink) {

    logoutLink.addEventListener("click", function (event) {

        event.preventDefault();

        logoutUser();

        window.location.href = "login.html?loggedout=true";

    });

}


/* ==============================
   9. INITIALIZE PROFILE PAGE
============================== */

document.addEventListener("DOMContentLoaded", function () {

    if (!profileUser) {
        return;
    }

    renderProfile(profileUser);
    renderProfileStats(profileUser);
    renderRecentOrders(profileUser);

});
