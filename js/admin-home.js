
/* ==================================================
   FAYNEX - ADMIN DASHBOARD HOME
================================================== */


/* ==============================
   1. HELPERS
============================== */

// Is the date in the current month?
function isThisMonth(date) {
    const parsedDate = new Date(date);
    const today = new Date();

    return parsedDate.getMonth() === today.getMonth()
        && parsedDate.getFullYear() === today.getFullYear();
}

// Read customer messages from the Contact page
function getContactMessages() {
    try {
        const messages = JSON.parse(localStorage.getItem("faynexMessages") || "[]");
        return Array.isArray(messages) ? messages : [];
    } catch (error) {
        return [];
    }
}


/* ==============================
   2. STATISTICS
============================== */

function renderHomeStats() {

    const products = getStoreProducts();
    const orders = getAdminOrders();
    const customers = getAdminCustomers();

    const ordersThisMonth = orders.filter(order => isThisMonth(order.orderDate));
    const customersThisMonth = customers.filter(customer => isThisMonth(customer.joined));
    const outOfStock = products.filter(product => Number(product.stock) <= 0).length;

    document.getElementById("stat-products").textContent = products.length;
    document.getElementById("stat-products-note").textContent =
        outOfStock ? `${outOfStock} out of stock` : "All in stock";

    document.getElementById("stat-orders").textContent = orders.length;
    document.getElementById("stat-orders-note").textContent =
        `${ordersThisMonth.length} this month`;

    document.getElementById("stat-customers").textContent = customers.length;
    document.getElementById("stat-customers-note").textContent =
        `${customersThisMonth.length} new this month`;

    document.getElementById("stat-revenue").textContent = formatAdminPrice(getOrdersRevenue(orders));
    document.getElementById("stat-revenue-note").textContent =
        `${formatAdminPrice(getOrdersRevenue(ordersThisMonth))} this month`;
}


/* ==============================
   3. RECENT ORDERS
============================== */

// The home page uses its own status colors (admin-home.css)
function getHomeStatusClass(status) {
    return "status " + status.toLowerCase();
}

function renderRecentOrders() {

    const tableBody = document.getElementById("recent-orders-body");
    const orders = getAdminOrders().slice(0, 5);

    if (orders.length === 0) {
        renderEmptyRow(tableBody, 5, "No orders yet.");
        return;
    }

    tableBody.innerHTML = orders.map(function (order) {

        const status = getOrderStatus(order);

        return `
            <tr>
                <td>#${escapeAdminHTML(order.orderNumber)}</td>
                <td>${escapeAdminHTML(getOrderCustomerName(order))}</td>
                <td>${formatAdminDate(order.orderDate)}</td>
                <td>${formatAdminPrice(order.total)}</td>
                <td><span class="${getHomeStatusClass(status)}">${status}</span></td>
            </tr>
        `;

    }).join("");
}


/* ==============================
   4. SALES OVERVIEW
============================== */

function renderSalesOverview() {

    const orders = getAdminOrders();
    const monthlySales = getMonthlySales(orders, 6);

    const totalLastMonths = monthlySales.reduce(function (sum, month) {
        return sum + month.value;
    }, 0);

    document.getElementById("sales-total").textContent = formatAdminPrice(totalLastMonths);

    renderBarChart(document.getElementById("sales-chart"), monthlySales);
}


/* ==============================
   5. TOP SELLING PRODUCTS
============================== */

function renderTopProducts() {

    const list = document.getElementById("top-products-list");
    const topProducts = getTopProducts(getAllOrders(), 3);

    if (topProducts.length === 0) {
        list.innerHTML = '<p class="empty-row">No sales yet.</p>';
        return;
    }

    list.innerHTML = topProducts.map(function (product) {

        // Cart images are saved with "../images/" so they work from the dashboard too
        return `
            <div class="product-item">
                <img src="${escapeAdminHTML(product.image)}" alt="${escapeAdminHTML(product.name)}">
                <div class="product-info">
                    <h4>${escapeAdminHTML(product.name)}</h4>
                    <span>${product.quantity} Sales</span>
                </div>
                <strong>${formatAdminPrice(product.revenue)}</strong>
            </div>
        `;

    }).join("");
}


/* ==============================
   6. CUSTOMERS OVERVIEW
============================== */

function renderCustomersOverview() {

    const container = document.getElementById("customers-overview");
    const customers = getAdminCustomers();

    const registered = customers.filter(customer => customer.type === "Registered").length;
    const guests = customers.length - registered;
    const withOrders = customers.filter(customer => customer.orders.length > 0).length;

    container.innerHTML = `
        <ul class="details-list">
            <li><span>Registered Customers</span><strong>${registered}</strong></li>
            <li><span>Guest Customers</span><strong>${guests}</strong></li>
            <li><span>Customers With Orders</span><strong>${withOrders}</strong></li>
            <li class="total-line"><span>Total Customers</span><span>${customers.length}</span></li>
        </ul>
    `;
}


/* ==============================
   7. CUSTOMER MESSAGES
============================== */

function renderMessagesCount() {

    const newMessages = getContactMessages().filter(message => message.status === "New");

    const badge = document.getElementById("messages-count");

    badge.textContent = newMessages.length;
    badge.hidden = newMessages.length === 0;
}


function openMessagesModal() {

    const messages = getContactMessages().slice().reverse();

    const body = messages.length
        ? messages.map(function (message) {
            return `
                <div class="details-grid">
                    <div><span>From</span><strong>${escapeAdminHTML(message.name)}</strong></div>
                    <div><span>Email</span><strong>${escapeAdminHTML(message.email)}</strong></div>
                    <div><span>Subject</span><strong>${escapeAdminHTML(message.subject)}</strong></div>
                    <div><span>Date</span><strong>${formatAdminDate(message.date)}</strong></div>
                </div>
                <p>${escapeAdminHTML(message.message)}</p>
                <hr class="details-separator">
            `;
        }).join("")
        : '<p class="empty-row">No messages yet.</p>';

    openAdminModal("Customer Messages", body);

    // Opening the list marks all messages as read
    const readMessages = getContactMessages().map(function (message) {
        return { ...message, status: "Read" };
    });

    localStorage.setItem("faynexMessages", JSON.stringify(readMessages));

    renderMessagesCount();
}


/* ==============================
   8. INITIALIZE DASHBOARD HOME
============================== */

document.addEventListener("DOMContentLoaded", function () {

    renderHomeStats();
    renderRecentOrders();
    renderSalesOverview();
    renderTopProducts();
    renderCustomersOverview();
    renderMessagesCount();

    document.getElementById("messages-btn")
        .addEventListener("click", openMessagesModal);

});
