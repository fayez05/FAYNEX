
/* ==================== My Orders ==================== */

// Orders container
const ordersContainer = document.getElementById("orders-container");

// ==================== Helper Functions ====================

// Format prices
function formatOrderPrice(price) {
    const numericPrice = Number(
        String(price ?? 0).replace(/[^0-9.-]/g, "")
    );

    // Shared JOD format from main.js
    return formatCurrency(Number.isFinite(numericPrice) ? numericPrice : 0);
}

// Convert prices to numbers for calculations
function getOrderPrice(price) {
    const numericPrice = Number(
        String(price ?? 0).replace(/[^0-9.-]/g, "")
    );

    return Number.isFinite(numericPrice) ? numericPrice : 0;
}

// Format order date
function formatOrderDate(date) {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

// Escape text before inserting it into HTML
function escapeOrderHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Get the total number of product units
function getOrderItemsCount(order) {
    if (!Array.isArray(order.products)) {
        return 0;
    }

    return order.products.reduce((total, product) => {
        return total + Math.max(0, Number(product.quantity) || 1);
    }, 0);
}

// Get the CSS class for each order status
function getOrderStatusClass(status) {
    const normalizedStatus = String(status || "Pending")
        .toLowerCase()
        .trim();

    const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ];

    return allowedStatuses.includes(normalizedStatus)
        ? normalizedStatus
        : "pending";
}

// Display status with a readable label
function formatOrderStatus(status) {
    const normalizedStatus = getOrderStatusClass(status);

    return normalizedStatus.charAt(0).toUpperCase()
        + normalizedStatus.slice(1);
}

// Get product name
function getOrderProductName(product) {
    return product.name
        || product.title
        || product.productName
        || "Product";
}

// Get product price
function getOrderProductPrice(product) {
    return product.price
        ?? product.productPrice
        ?? 0;
}

// Get product quantity
function getOrderProductQuantity(product) {
    return Math.max(0, Number(product.quantity) || 1);
}


// ==================== Create Order Card ====================

function createOrderCard(order) {
    const orderCard = document.createElement("div");
    orderCard.className = "order-item";

    const orderHeader = document.createElement("div");
    orderHeader.className = "order-header";

    const orderTitle = document.createElement("h3");
    orderTitle.textContent =
        `Order #${order.orderNumber || "N/A"}`;

    const status = document.createElement("span");
    status.className = `status ${getOrderStatusClass(order.status)}`;
    status.textContent = formatOrderStatus(order.status);

    orderHeader.append(orderTitle, status);

    const orderDetails = document.createElement("div");
    orderDetails.className = "order-details";

    const dateParagraph = document.createElement("p");
    dateParagraph.innerHTML =
        `<strong>Date:</strong> ${escapeOrderHTML(
            formatOrderDate(order.orderDate)
        )}`;

    const totalParagraph = document.createElement("p");
    totalParagraph.innerHTML =
        `<strong>Total:</strong> ${escapeOrderHTML(
            formatOrderPrice(order.total)
        )}`;

    const itemsParagraph = document.createElement("p");
    const itemsCount = getOrderItemsCount(order);

    itemsParagraph.innerHTML =
        `<strong>Items:</strong> ${itemsCount} ${
            itemsCount === 1 ? "Product" : "Products"
        }`;

    orderDetails.append(
        dateParagraph,
        totalParagraph,
        itemsParagraph
    );

    const orderActions = document.createElement("div");
    orderActions.className = "order-actions";

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "details-btn";
    detailsButton.textContent = "View Details";

    detailsButton.addEventListener("click", () => {
        showOrderDetails(order);
    });

    orderActions.appendChild(detailsButton);

    // Pending orders can still be cancelled by the customer
    if (getOrderStatusClass(order.status) === "pending") {

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "cancel-order-btn";
        cancelButton.textContent = "Cancel Order";

        cancelButton.addEventListener("click", () => {
            cancelCustomerOrder(order.orderNumber);
        });

        orderActions.appendChild(cancelButton);
    }

    orderCard.append(
        orderHeader,
        orderDetails,
        orderActions
    );

    return orderCard;
}


// ==================== Create Details Modal ====================

function createOrderModal() {
    // Reuse the modal if it already exists
    let modal = document.getElementById("order-details-modal");

    if (modal) {
        return modal;
    }

    modal = document.createElement("div");
    modal.id = "order-details-modal";
    modal.className = "order-modal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div
            class="order-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            tabindex="-1"
        >

            <div class="order-modal-header">

                <div>
                    <h2 id="order-modal-title">Order Details</h2>
                    <p class="order-modal-subtitle">
                        Review your order information
                    </p>
                </div>

                <button
                    type="button"
                    class="order-modal-close"
                    aria-label="Close order details"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>

            <div class="order-modal-body" id="order-modal-body">
            </div>

            <div class="order-modal-footer">
                <button
                    type="button"
                    class="order-modal-done"
                >
                    Close
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".order-modal-close");
    const doneButton = modal.querySelector(".order-modal-done");

    closeButton.addEventListener("click", closeOrderModal);
    doneButton.addEventListener("click", closeOrderModal);

    // Close when clicking outside the modal content
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeOrderModal();
        }
    });

    return modal;
}


// ==================== Show Order Details ====================

function showOrderDetails(order) {
    const modal = createOrderModal();
    const modalBody = modal.querySelector("#order-modal-body");

    const customer = order.customer || {};
    const address = order.shippingAddress || {};
    const products = Array.isArray(order.products)
        ? order.products
        : [];

    const statusClass = getOrderStatusClass(order.status);
    const statusLabel = formatOrderStatus(order.status);

    const fullName = [
        customer.firstName,
        customer.lastName
    ].filter(Boolean).join(" ");

    const addressParts = [
        address.streetAddress,
        address.apartment,
        address.governorate,
        address.zipCode,
        address.country
    ].filter(Boolean);

    const shippingAddress = addressParts.length
        ? addressParts.join(", ")
        : "Not available";

    const productRows = products.length
        ? products.map(product => {
            const productName = getOrderProductName(product);
            const quantity = getOrderProductQuantity(product);
            const price = getOrderPrice(
                getOrderProductPrice(product)
            );

            return `
                <div class="order-product-row">

                    <div class="order-product-info">
                        <h4>${escapeOrderHTML(productName)}</h4>
                        <p>Quantity: ${quantity}</p>
                    </div>

                    <div class="order-product-price">
                        ${escapeOrderHTML(
                            formatOrderPrice(price * quantity)
                        )}
                    </div>

                </div>
            `;
        }).join("")
        : `
            <p class="order-modal-empty">
                No product details are available.
            </p>
        `;

    const subtotal = getOrderPrice(order.subtotal);
    const discount = getOrderPrice(order.discount);
    const shipping = getOrderPrice(order.shipping);
    const tax = getOrderPrice(order.tax);
    const total = getOrderPrice(order.total);

    modalBody.innerHTML = `

        <!-- Order Summary -->

        <section class="order-modal-section">

            <div class="order-modal-order-header">

                <div>
                    <span class="order-modal-label">Order Number</span>
                    <h3>
                        #${escapeOrderHTML(order.orderNumber || "N/A")}
                    </h3>
                </div>

                <span class="status ${statusClass}">
                    ${statusLabel}
                </span>

            </div>

            <div class="order-modal-info-grid">

                <div>
                    <span class="order-modal-label">Order Date</span>
                    <p>
                        ${escapeOrderHTML(
                            formatOrderDate(order.orderDate)
                        )}
                    </p>
                </div>

                <div>
                    <span class="order-modal-label">Payment Method</span>
                    <p>
                        ${escapeOrderHTML(
                            order.paymentMethod || "Not available"
                        )}
                    </p>
                </div>

            </div>

        </section>


        <!-- Products -->

        <section class="order-modal-section">

            <h3 class="order-modal-section-title">
                <i class="fa-solid fa-box"></i>
                Ordered Products
            </h3>

            <div class="order-modal-products">
                ${productRows}
            </div>

        </section>


        <!-- Shipping Information -->

        <section class="order-modal-section">

            <h3 class="order-modal-section-title">
                <i class="fa-solid fa-location-dot"></i>
                Shipping Information
            </h3>

            <div class="order-modal-info-grid">

                <div>
                    <span class="order-modal-label">Customer</span>
                    <p>
                        ${escapeOrderHTML(fullName || "Not available")}
                    </p>
                </div>

                <div>
                    <span class="order-modal-label">Email</span>
                    <p>
                        ${escapeOrderHTML(customer.email || "Not available")}
                    </p>
                </div>

                <div>
                    <span class="order-modal-label">Phone</span>
                    <p>
                        ${escapeOrderHTML(customer.phone || "Not available")}
                    </p>
                </div>

                <div>
                    <span class="order-modal-label">Delivery Address</span>
                    <p>
                        ${escapeOrderHTML(shippingAddress)}
                    </p>
                </div>

            </div>

        </section>


        <!-- Price Summary -->

        <section class="order-modal-section">

            <h3 class="order-modal-section-title">
                <i class="fa-solid fa-receipt"></i>
                Order Summary
            </h3>

            <div class="order-price-row">
                <span>Subtotal</span>
                <span>${escapeOrderHTML(formatOrderPrice(subtotal))}</span>
            </div>

            <div class="order-price-row">
                <span>Discount</span>
                <span class="order-discount">
                    -${escapeOrderHTML(formatOrderPrice(discount))}
                </span>
            </div>

            <div class="order-price-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? "Free" : escapeOrderHTML(formatOrderPrice(shipping))}</span>
            </div>

            <div class="order-price-row">
                <span>Tax</span>
                <span>${escapeOrderHTML(formatOrderPrice(tax))}</span>
            </div>

            <div class="order-price-row order-price-total">
                <strong>Total</strong>
                <strong>${escapeOrderHTML(formatOrderPrice(total))}</strong>
            </div>

        </section>

    `;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("order-modal-open");

    modal.querySelector(".order-modal-content").focus();
}


// ==================== Close Modal ====================

function closeOrderModal() {
    const modal = document.getElementById("order-details-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("order-modal-open");
}


// Close modal with Escape key
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeOrderModal();
    }
});


// ==================== Load Orders ====================

function renderMyOrders() {
    if (!ordersContainer) {
        return;
    }

    let orders = [];

    try {
        const savedOrders = JSON.parse(
            localStorage.getItem("faynexOrders") || "[]"
        );

        if (Array.isArray(savedOrders)) {
            orders = savedOrders;
        }
    } catch (error) {
        console.error("Could not read saved orders:", error);
    }

    // Include the latest order if it is not already in the list
    try {
        const lastOrder = JSON.parse(
            localStorage.getItem("faynexLastOrder") || "null"
        );

        if (
            lastOrder &&
            !orders.some(order =>
                order.orderNumber === lastOrder.orderNumber
            )
        ) {
            orders.push(lastOrder);

            localStorage.setItem(
                "faynexOrders",
                JSON.stringify(orders)
            );
        }
    } catch (error) {
        console.error("Could not read the latest order:", error);
    }

    // Logged in users see only their own orders
    const currentUser = getCurrentUser();

    if (currentUser) {
        const userOrderNumbers = getUserOrders(currentUser).map(order => order.orderNumber);

        orders = orders.filter(order => userOrderNumbers.includes(order.orderNumber));
    } else {
        // Guests do not see orders that belong to a registered account
        orders = orders.filter(order => {
            const orderEmail = String(order.customer?.email || "").toLowerCase();

            return !order.userId && !findUserByEmail(orderEmail);
        });
    }

    ordersContainer.innerHTML = "";

    // Empty state
    if (orders.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-orders";
        emptyMessage.textContent =
            "You haven't placed any orders yet. Your orders will appear here after checkout.";

        ordersContainer.appendChild(emptyMessage);
        return;
    }

    // Show newest orders first
    orders.sort((firstOrder, secondOrder) => {
        return new Date(secondOrder.orderDate || 0)
            - new Date(firstOrder.orderDate || 0);
    });

    orders.forEach(order => {
        ordersContainer.appendChild(createOrderCard(order));
    });
}


// ==================== Cancel Confirmation Modal ====================

// Same look as the order details modal. Calls onConfirm only on "Yes".
function showCancelConfirm(orderNumber, onConfirm) {
    let modal = document.getElementById("cancel-confirm-modal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "cancel-confirm-modal";
        modal.className = "order-modal";
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <div
                class="order-modal-content confirm-modal-content"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="cancel-confirm-title"
                aria-describedby="cancel-confirm-text"
                tabindex="-1"
            >

                <div class="order-modal-header">
                    <h2 id="cancel-confirm-title">Cancel Order?</h2>
                </div>

                <div class="order-modal-body">
                    <p class="confirm-modal-text" id="cancel-confirm-text"></p>
                </div>

                <div class="order-modal-footer">
                    <button type="button" class="confirm-keep-btn">
                        Keep Order
                    </button>

                    <button type="button" class="confirm-cancel-btn">
                        Yes, Cancel
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector(".confirm-keep-btn")
            .addEventListener("click", closeCancelConfirm);

        // Close when clicking outside the modal content
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeCancelConfirm();
            }
        });
    }

    modal.querySelector("#cancel-confirm-text").textContent =
        `Are you sure you want to cancel order #${orderNumber}? This cannot be undone.`;

    // Replace the old listener with one for this order
    const yesButton = modal.querySelector(".confirm-cancel-btn");
    yesButton.onclick = function () {
        closeCancelConfirm();
        onConfirm();
    };

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("order-modal-open");
    modal.querySelector(".confirm-keep-btn").focus();
}


function closeCancelConfirm() {
    const modal = document.getElementById("cancel-confirm-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("order-modal-open");
}


// Close with Escape key
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCancelConfirm();
    }
});


// ==================== Cancel Order ====================

function cancelCustomerOrder(orderNumber) {
    showCancelConfirm(orderNumber, function () {
        applyOrderCancel(orderNumber);
    });
}


function applyOrderCancel(orderNumber) {

    const orders = JSON.parse(localStorage.getItem("faynexOrders") || "[]");
    const order = orders.find(item => item.orderNumber === orderNumber);

    // Only pending orders can be cancelled
    if (!order || getOrderStatusClass(order.status) !== "pending") {
        showNotification(
            "This order can no longer be cancelled.",
            "Cannot Cancel",
            "error"
        );
        renderMyOrders();
        return;
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date().toISOString();

    localStorage.setItem("faynexOrders", JSON.stringify(orders));

    // Keep the confirmation page order in sync
    const lastOrder = JSON.parse(localStorage.getItem("faynexLastOrder") || "null");

    if (lastOrder && lastOrder.orderNumber === orderNumber) {
        localStorage.setItem("faynexLastOrder", JSON.stringify(order));
    }

    // Put the products back in stock (products.js)
    changeProductsStock(order.products, +1);

    renderMyOrders();

    showNotification(
        `Order #${orderNumber} has been cancelled.`,
        "Order Cancelled"
    );
}


// ==================== Initialize ====================

renderMyOrders();
