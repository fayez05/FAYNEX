
/* ==================================================
   FAYNEX - ADMIN CUSTOMERS
   Registered accounts + guests who placed orders
================================================== */


/* ==============================
   1. CUSTOMERS ELEMENTS & STATE
============================== */

const customersSearch = document.getElementById("customers-search");
const customersBody = document.getElementById("customers-body");
const customersPagination = document.getElementById("customers-pagination");

const CUSTOMERS_PER_PAGE = 8;

let customersPage = 1;


/* ==============================
   2. STATISTICS
============================== */

function renderCustomersStats() {

    const customers = getAdminCustomers();
    const today = new Date();

    const activeCustomers = customers.filter(customer => customer.orders.length > 0);

    const newCustomers = customers.filter(function (customer) {
        const joined = new Date(customer.joined);
        return joined.getMonth() === today.getMonth() && joined.getFullYear() === today.getFullYear();
    });

    document.getElementById("total-customers").textContent =
        customers.length + (customers.length === 1 ? " Customer" : " Customers");

    document.getElementById("active-customers").textContent = activeCustomers.length + " Active";

    document.getElementById("new-customers").textContent =
        newCustomers.length + (newCustomers.length === 1 ? " Customer" : " Customers");
}


/* ==============================
   3. CUSTOMERS TABLE
============================== */

function getFilteredCustomers() {

    const searchValue = customersSearch.value.trim().toLowerCase();

    return getAdminCustomers()
        .filter(function (customer) {
            return [customer.name, customer.email, customer.phone]
                .join(" ")
                .toLowerCase()
                .includes(searchValue);
        })
        .sort((a, b) => new Date(b.joined) - new Date(a.joined));
}


function renderCustomersTable() {

    const customers = getFilteredCustomers();

    const totalPages = Math.max(1, Math.ceil(customers.length / CUSTOMERS_PER_PAGE));
    customersPage = Math.min(customersPage, totalPages);

    if (customers.length === 0) {
        renderEmptyRow(customersBody, 7, "No customers found.");
        renderAdminPagination(customersPagination, 0, CUSTOMERS_PER_PAGE, 1, function () {});
        return;
    }

    const pageCustomers = customers.slice(
        (customersPage - 1) * CUSTOMERS_PER_PAGE,
        customersPage * CUSTOMERS_PER_PAGE
    );

    customersBody.innerHTML = pageCustomers.map(function (customer) {

        const isRegistered = customer.type === "Registered";
        const name = escapeAdminHTML(customer.name);
        const email = escapeAdminHTML(customer.email);

        return `
            <tr>
                <td>
                    <div class="customer-info">
                        <div class="admin-avatar">${escapeAdminHTML(getInitials(customer.name))}</div>
                        <div>
                            <h4>${name}</h4>
                            <span>${isRegistered ? "ID: #" + escapeAdminHTML(customer.id) : "Guest"}</span>
                        </div>
                    </div>
                </td>
                <td>${email}</td>
                <td>${escapeAdminHTML(customer.phone)}</td>
                <td>${customer.orders.length}</td>
                <td>
                    <span class="${isRegistered ? "active-status" : "pending-status"}">
                        ${isRegistered ? "Registered" : "Guest"}
                    </span>
                </td>
                <td>${formatAdminDate(customer.joined)}</td>
                <td class="actions">
                    <button class="view-btn" type="button" data-email="${email}" aria-label="View ${name}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;

    }).join("");

    renderAdminPagination(customersPagination, customers.length, CUSTOMERS_PER_PAGE, customersPage, function (page) {
        customersPage = page;
        renderCustomersTable();
    });
}


/* ==============================
   4. VIEW CUSTOMER
============================== */

function openCustomerDetails(email) {

    const customer = getAdminCustomers().find(item => item.email === email);

    if (!customer) {
        return;
    }

    const orders = customer.orders
        .slice()
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    const ordersHTML = orders.length
        ? orders.map(function (order) {
            return `
                <li>
                    <span>#${escapeAdminHTML(order.orderNumber)} · ${formatAdminDate(order.orderDate)} · ${getOrderStatus(order)}</span>
                    <strong>${formatAdminPrice(order.total)}</strong>
                </li>
            `;
        }).join("")
        : "<li><span>No orders yet.</span></li>";

    const body = `
        <div class="details-grid">
            <div><span>Name</span><strong>${escapeAdminHTML(customer.name)}</strong></div>
            <div><span>Type</span><strong>${customer.type}</strong></div>
            <div><span>Email</span><strong>${escapeAdminHTML(customer.email)}</strong></div>
            <div><span>Phone</span><strong>${escapeAdminHTML(customer.phone)}</strong></div>
            <div><span>Joined</span><strong>${formatAdminDate(customer.joined)}</strong></div>
            <div><span>Total Spent</span><strong>${formatAdminPrice(getOrdersRevenue(orders))}</strong></div>
        </div>

        <h3 class="details-title">Orders (${orders.length})</h3>
        <ul class="details-list">${ordersHTML}</ul>
    `;

    openAdminModal(customer.name, body);
}


/* ==============================
   5. NEWSLETTER SUBSCRIBERS
   Saved by the Newsletter form on the Home page
============================== */

function renderSubscribers() {

    const tableBody = document.getElementById("subscribers-body");

    let subscribers = [];

    try {
        subscribers = JSON.parse(localStorage.getItem("faynexSubscribers") || "[]");
    } catch (error) {
        subscribers = [];
    }

    if (!Array.isArray(subscribers)) {
        subscribers = [];
    }

    document.getElementById("subscribers-count").textContent = subscribers.length;

    if (subscribers.length === 0) {
        renderEmptyRow(tableBody, 4, "No subscribers yet.");
        return;
    }

    // Newest first
    tableBody.innerHTML = subscribers
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(function (subscriber, index) {

            const hasAccount = Boolean(findUserByEmail(subscriber.email));

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeAdminHTML(subscriber.email)}</td>
                    <td>${formatAdminDate(subscriber.date)}</td>
                    <td>
                        <span class="${hasAccount ? "active-status" : "pending-status"}">
                            ${hasAccount ? "Registered" : "Guest"}
                        </span>
                    </td>
                </tr>
            `;

        }).join("");
}


/* ==============================
   6. INITIALIZE CUSTOMERS PAGE
============================== */

customersSearch.addEventListener("input", function () {
    customersPage = 1;
    renderCustomersTable();
});

customersBody.addEventListener("click", function (event) {
    const button = event.target.closest(".view-btn");

    if (button) {
        openCustomerDetails(button.dataset.email);
    }
});

renderCustomersStats();
renderCustomersTable();
renderSubscribers();
