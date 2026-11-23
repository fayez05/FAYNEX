
/* ==================================================
   FAYNEX - ADMIN ORDERS
================================================== */


/* ==============================
   1. ORDERS ELEMENTS & STATE
============================== */

const ordersSearch = document.getElementById("orders-search");
const ordersBody = document.getElementById("orders-body");
const ordersPagination = document.getElementById("orders-pagination");
const statusCards = document.querySelectorAll(".category-card[data-filter]");

const ORDERS_PER_PAGE = 8;

let ordersPage = 1;
let ordersStatusFilter = null;


/* ==============================
   2. STATUS COUNTS
============================== */

function renderStatusCounts() {

    const orders = getAdminOrders();

    statusCards.forEach(function (card) {

        const status = card.dataset.filter;

        const count = orders.filter(function (order) {
            return getOrderStatus(order) === status;
        }).length;

        document.getElementById("count-" + status.toLowerCase()).textContent =
            count + (count === 1 ? " Order" : " Orders");

        card.classList.toggle("active", ordersStatusFilter === status);
    });
}


/* ==============================
   3. ORDERS TABLE
============================== */

function getFilteredOrders() {

    const searchValue = ordersSearch.value.trim().toLowerCase();

    return getAdminOrders().filter(function (order) {

        const matchesStatus = !ordersStatusFilter || getOrderStatus(order) === ordersStatusFilter;

        const searchText = [
            order.orderNumber,
            getOrderCustomerName(order),
            order.customer?.email
        ].join(" ").toLowerCase();

        return matchesStatus && searchText.includes(searchValue);
    });
}


function getPaymentLabel(order) {
    return String(order.paymentMethod || "").toLowerCase().includes("cash")
        ? "Cash on Delivery"
        : "Card";
}


function renderOrdersTable() {

    const orders = getFilteredOrders();

    const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
    ordersPage = Math.min(ordersPage, totalPages);

    if (orders.length === 0) {
        renderEmptyRow(ordersBody, 7, "No orders found.");
        renderAdminPagination(ordersPagination, 0, ORDERS_PER_PAGE, 1, function () {});
        return;
    }

    const pageOrders = orders.slice(
        (ordersPage - 1) * ORDERS_PER_PAGE,
        ordersPage * ORDERS_PER_PAGE
    );

    ordersBody.innerHTML = pageOrders.map(function (order) {

        const status = getOrderStatus(order);
        const orderNumber = escapeAdminHTML(order.orderNumber);

        return `
            <tr>
                <td>#${orderNumber}</td>
                <td>${escapeAdminHTML(getOrderCustomerName(order))}</td>
                <td>${formatAdminDate(order.orderDate)}</td>
                <td>${formatAdminPrice(order.total)}</td>
                <td><span class="${getStatusBadgeClass(status)}">${status}</span></td>
                <td>${getPaymentLabel(order)}</td>
                <td class="actions">
                    <button class="view-btn" type="button" data-order="${orderNumber}" aria-label="View order ${orderNumber}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="edit-btn" type="button" data-order="${orderNumber}" aria-label="Change status of order ${orderNumber}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            </tr>
        `;

    }).join("");

    renderAdminPagination(ordersPagination, orders.length, ORDERS_PER_PAGE, ordersPage, function (page) {
        ordersPage = page;
        renderOrdersTable();
    });
}


/* ==============================
   4. VIEW ORDER
============================== */

function findOrder(orderNumber) {
    return getAllOrders().find(function (order) {
        return order.orderNumber === orderNumber;
    });
}


function openOrderDetails(orderNumber) {

    const order = findOrder(orderNumber);

    if (!order) {
        return;
    }

    const address = order.shippingAddress || {};

    const addressText = [
        address.streetAddress,
        address.apartment,
        address.governorate,
        address.zipCode,
        address.country
    ].filter(Boolean).join(", ");

    const productsHTML = (order.products || []).map(function (product) {

        const options = [product.color, product.storage].filter(Boolean).join(" / ");

        return `
            <li>
                <span>${escapeAdminHTML(product.name)} × ${Number(product.quantity) || 1}
                    ${options ? `<small>(${escapeAdminHTML(options)})</small>` : ""}</span>
                <strong>${formatAdminPrice((Number(product.price) || 0) * (Number(product.quantity) || 1))}</strong>
            </li>
        `;

    }).join("");

    const body = `
        <div class="details-grid">
            <div><span>Customer</span><strong>${escapeAdminHTML(getOrderCustomerName(order))}</strong></div>
            <div><span>Email</span><strong>${escapeAdminHTML(order.customer?.email || "-")}</strong></div>
            <div><span>Phone</span><strong>${escapeAdminHTML(order.customer?.phone || "-")}</strong></div>
            <div><span>Date</span><strong>${formatAdminDate(order.orderDate)}</strong></div>
            <div><span>Payment</span><strong>${escapeAdminHTML(order.paymentMethod || "-")}</strong></div>
            <div><span>Status</span><strong>${getOrderStatus(order)}</strong></div>
        </div>

        <div class="details-grid">
            <div><span>Delivery Address</span><strong>${escapeAdminHTML(addressText || "-")}</strong></div>
        </div>

        <h3 class="details-title">Products</h3>
        <ul class="details-list">${productsHTML}</ul>

        <h3 class="details-title">Summary</h3>
        <ul class="details-list">
            <li><span>Subtotal</span><span>${formatAdminPrice(order.subtotal)}</span></li>
            <li><span>Discount</span><span>-${formatAdminPrice(order.discount)}</span></li>
            <li><span>Shipping</span><span>${Number(order.shipping) ? formatAdminPrice(order.shipping) : "Free"}</span></li>
            <li><span>Tax</span><span>${formatAdminPrice(order.tax)}</span></li>
            <li class="total-line"><span>Total</span><span>${formatAdminPrice(order.total)}</span></li>
        </ul>
    `;

    openAdminModal("Order #" + order.orderNumber, body);
}


/* ==============================
   5. CHANGE ORDER STATUS
============================== */

function openStatusEditor(orderNumber) {

    const order = findOrder(orderNumber);

    if (!order) {
        return;
    }

    const currentStatus = getOrderStatus(order);

    const options = ORDER_STATUSES.map(function (status) {
        return `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`;
    }).join("");

    const body = `
        <label for="order-status-select" class="details-title">Order Status</label>
        <select id="order-status-select" class="modal-select">${options}</select>
    `;

    openAdminModal("Update Order #" + order.orderNumber, body, [
        { text: "Cancel", onClick: closeAdminModal },
        {
            text: "Save Status",
            className: "modal-save-btn",
            onClick: function () {
                const newStatus = document.getElementById("order-status-select").value;
                saveOrderStatus(orderNumber, newStatus);
            }
        }
    ]);
}


function saveOrderStatus(orderNumber, newStatus) {

    const oldOrder = findOrder(orderNumber);
    const oldStatus = oldOrder ? getOrderStatus(oldOrder) : null;

    // Cancelling gives the products back to stock, un-cancelling takes them again
    if (oldOrder && oldStatus !== "Cancelled" && newStatus === "Cancelled") {
        changeProductsStock(oldOrder.products, +1);
    }

    if (oldOrder && oldStatus === "Cancelled" && newStatus !== "Cancelled") {
        changeProductsStock(oldOrder.products, -1);
    }

    const orders = getAllOrders().map(function (order) {
        return order.orderNumber === orderNumber
            ? { ...order, status: newStatus }
            : order;
    });

    localStorage.setItem("faynexOrders", JSON.stringify(orders));

    // Keep the last order (confirmation page) in sync
    try {
        const lastOrder = JSON.parse(localStorage.getItem("faynexLastOrder") || "null");

        if (lastOrder && lastOrder.orderNumber === orderNumber) {
            localStorage.setItem("faynexLastOrder", JSON.stringify({ ...lastOrder, status: newStatus }));
        }
    } catch (error) {
        // Nothing to update
    }

    closeAdminModal();
    renderStatusCounts();
    renderOrdersTable();

    showNotification(
        `Order #${orderNumber} is now ${newStatus}.`,
        "Status Updated"
    );
}


/* ==============================
   6. EVENTS
============================== */

ordersSearch.addEventListener("input", function () {
    ordersPage = 1;
    renderOrdersTable();
});

// Click a status card to filter, click again to show all
statusCards.forEach(function (card) {
    card.addEventListener("click", function () {
        ordersStatusFilter = ordersStatusFilter === card.dataset.filter ? null : card.dataset.filter;
        ordersPage = 1;
        renderStatusCounts();
        renderOrdersTable();
    });
});

// View and edit buttons
ordersBody.addEventListener("click", function (event) {

    const viewButton = event.target.closest(".view-btn");
    const editButton = event.target.closest(".edit-btn");

    if (viewButton) {
        openOrderDetails(viewButton.dataset.order);
    }

    if (editButton) {
        openStatusEditor(editButton.dataset.order);
    }
});


/* ==============================
   7. INITIALIZE ORDERS PAGE
============================== */

renderStatusCounts();
renderOrdersTable();
