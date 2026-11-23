
/* ==================================================
   FAYNEX - ADMIN JAVASCRIPT
   Shared code for all dashboard pages.
   Needs main.js and products.js loaded first.
================================================== */


/* ==================================================
   1. MOBILE SIDEBAR
================================================== */

function initializeAdminSidebar() {

    const sidebar = document.querySelector(".sidebar");
    const header = document.querySelector(".dashboard-header");

    if (!sidebar || !header) {
        return;
    }

    // Create the menu button and put it next to the page title
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "sidebar-toggle";
    toggleButton.setAttribute("aria-label", "Open menu");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.innerHTML = '<i class="fa-solid fa-bars"></i>';

    const titleBlock = header.firstElementChild;
    const titleWrapper = document.createElement("div");
    titleWrapper.className = "header-title";

    header.insertBefore(titleWrapper, titleBlock);
    titleWrapper.append(toggleButton, titleBlock);

    // Dark background behind the open sidebar
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);

    function setSidebarState(isOpen) {
        sidebar.classList.toggle("open", isOpen);
        overlay.classList.toggle("show", isOpen);
        toggleButton.setAttribute("aria-expanded", String(isOpen));
    }

    toggleButton.addEventListener("click", function () {
        setSidebarState(!sidebar.classList.contains("open"));
    });

    overlay.addEventListener("click", function () {
        setSidebarState(false);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            setSidebarState(false);
        }
    });
}


/* ==================================================
   2. FORMAT HELPERS
================================================== */

// JOD 1,234.50 (shared format from main.js)
function formatAdminPrice(value) {
    return formatCurrency(value);
}

// 23 Nov 2026
function formatAdminDate(date) {
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

// Make text safe before putting it inside HTML
function escapeAdminHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

// "Test User" -> "TU"
function getInitials(name) {
    return String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (word) {
            return word.charAt(0).toUpperCase();
        })
        .join("");
}


/* ==================================================
   3. ORDER STATUS
================================================== */

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// Always returns one of ORDER_STATUSES
function getOrderStatus(order) {
    const status = String(order.status || "Pending").toLowerCase();

    return ORDER_STATUSES.find(function (item) {
        return item.toLowerCase() === status;
    }) || "Pending";
}

// CSS class used by the dashboard tables
function getStatusBadgeClass(status) {
    return {
        Pending: "status pending-status",
        Processing: "status processing-status",
        Shipped: "status shipped-status",
        Delivered: "status active-status",
        Cancelled: "status out-stock"
    }[status] || "status pending-status";
}


/* ==================================================
   4. STORE DATA
================================================== */

// All orders, newest first
function getAdminOrders() {
    return getAllOrders().slice().sort(function (a, b) {
        return new Date(b.orderDate) - new Date(a.orderDate);
    });
}

// Revenue from orders that were not cancelled
function getOrdersRevenue(orders) {
    return orders.reduce(function (sum, order) {
        if (getOrderStatus(order) === "Cancelled") {
            return sum;
        }

        return sum + (Number(order.total) || 0);
    }, 0);
}

// Customer full name from an order
function getOrderCustomerName(order) {
    const customer = order.customer || {};
    const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

    return name || "Guest";
}

// Registered users + guests who placed orders
function getAdminCustomers() {

    const orders = getAllOrders();

    const customers = getUsers().map(function (user) {
        return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || "-",
            joined: user.createdAt,
            type: "Registered",
            orders: getUserOrders(user)
        };
    });

    // Guests: orders with an email that has no account
    orders.forEach(function (order) {

        const email = String(order.customer?.email || "").toLowerCase();

        if (!email || order.userId || findUserByEmail(email)) {
            return;
        }

        let guest = customers.find(function (customer) {
            return customer.type === "Guest" && customer.email === email;
        });

        if (!guest) {
            guest = {
                id: "GUEST-" + (customers.length + 1),
                name: getOrderCustomerName(order),
                email: email,
                phone: order.customer?.phone || "-",
                joined: order.orderDate,
                type: "Guest",
                orders: []
            };

            customers.push(guest);
        }

        guest.orders.push(order);

        // Joined = date of the first order
        if (new Date(order.orderDate) < new Date(guest.joined)) {
            guest.joined = order.orderDate;
        }
    });

    return customers;
}

// Sales of the last months, for the bar chart
function getMonthlySales(orders, monthsCount = 6) {

    const months = [];
    const today = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

        months.push({
            key: date.getFullYear() + "-" + date.getMonth(),
            label: date.toLocaleDateString("en-GB", { month: "short" }),
            value: 0
        });
    }

    orders.forEach(function (order) {

        if (getOrderStatus(order) === "Cancelled") {
            return;
        }

        const date = new Date(order.orderDate);
        const key = date.getFullYear() + "-" + date.getMonth();

        const month = months.find(function (item) {
            return item.key === key;
        });

        if (month) {
            month.value += Number(order.total) || 0;
        }
    });

    return months;
}

// Best-selling products by quantity
function getTopProducts(orders, limit = 5) {

    const totals = {};

    orders.forEach(function (order) {

        if (getOrderStatus(order) === "Cancelled" || !Array.isArray(order.products)) {
            return;
        }

        order.products.forEach(function (product) {

            const name = product.name || "Product";

            if (!totals[name]) {
                totals[name] = { name: name, quantity: 0, revenue: 0, image: product.image };
            }

            const quantity = Number(product.quantity) || 1;

            totals[name].quantity += quantity;
            totals[name].revenue += quantity * (Number(product.price) || 0);
        });
    });

    return Object.values(totals)
        .sort(function (a, b) {
            return b.quantity - a.quantity;
        })
        .slice(0, limit);
}


/* ==================================================
   5. TABLE HELPERS
================================================== */

// One row with a message when the table is empty
function renderEmptyRow(tableBody, columns, message) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="${columns}" class="empty-row">${escapeAdminHTML(message)}</td>
        </tr>
    `;
}

// Page buttons under a table
function renderAdminPagination(container, totalItems, perPage, currentPage, onPageChange) {

    if (!container) {
        return;
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    container.innerHTML = "";
    container.hidden = totalPages <= 1;

    function addButton(content, page, isActive, isDisabled) {
        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = content;
        button.disabled = isDisabled;

        if (isActive) {
            button.classList.add("active-page");
        }

        button.addEventListener("click", function () {
            onPageChange(page);
        });

        container.appendChild(button);
    }

    addButton('<i class="fa-solid fa-angle-left"></i>', currentPage - 1, false, currentPage === 1);

    for (let page = 1; page <= totalPages; page++) {
        addButton(String(page), page, page === currentPage, false);
    }

    addButton('<i class="fa-solid fa-angle-right"></i>', currentPage + 1, false, currentPage === totalPages);
}


/* ==================================================
   6. ADMIN MODAL
================================================== */

function openAdminModal(title, bodyHTML, footerButtons = []) {

    closeAdminModal();

    const modal = document.createElement("div");
    modal.className = "admin-modal";
    modal.id = "admin-modal";

    modal.innerHTML = `
        <div class="admin-modal-content" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
            <div class="admin-modal-header">
                <h2 id="admin-modal-title">${escapeAdminHTML(title)}</h2>
                <button type="button" class="admin-modal-close" aria-label="Close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="admin-modal-body">${bodyHTML}</div>
            <div class="admin-modal-footer"></div>
        </div>
    `;

    // Footer buttons: [{ text, className, onClick }]
    const footer = modal.querySelector(".admin-modal-footer");

    const buttons = footerButtons.length
        ? footerButtons
        : [{ text: "Close", onClick: closeAdminModal }];

    buttons.forEach(function (buttonData) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = buttonData.text;

        if (buttonData.className) {
            button.className = buttonData.className;
        }

        button.addEventListener("click", buttonData.onClick);
        footer.appendChild(button);
    });

    // Close with ×, outside click, or Escape
    modal.querySelector(".admin-modal-close").addEventListener("click", closeAdminModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeAdminModal();
        }
    });

    document.body.appendChild(modal);

    return modal;
}

function closeAdminModal() {
    document.getElementById("admin-modal")?.remove();
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeAdminModal();
    }
});


/* ==================================================
   7. BAR CHART
================================================== */

// data: [{ label, value }]
function renderBarChart(container, data) {

    if (!container) {
        return;
    }

    const maxValue = Math.max(1, ...data.map(function (item) {
        return item.value;
    }));

    container.className = "bar-chart";
    container.innerHTML = "";

    data.forEach(function (item) {

        const barItem = document.createElement("div");
        barItem.className = "bar-item";

        const value = document.createElement("span");
        value.className = "bar-value";
        value.textContent = formatCurrency(item.value, 0);

        const bar = document.createElement("div");
        bar.className = "bar";
        // 75% max, to leave room for the value and the label
        bar.style.height = Math.max(2, (item.value / maxValue) * 75) + "%";

        const label = document.createElement("span");
        label.className = "bar-label";
        label.textContent = item.label;

        barItem.append(value, bar, label);
        container.appendChild(barItem);
    });
}


/* ==================================================
   8. INITIALIZE ADMIN
================================================== */

document.addEventListener("DOMContentLoaded", initializeAdminSidebar);
