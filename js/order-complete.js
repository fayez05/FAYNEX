
/* ==============================
   1. GET ORDER ELEMENTS
============================== */

const orderNumberElement = document.getElementById("order-number");
const orderDateElement = document.getElementById("order-date");
const orderStatusElement = document.getElementById("order-status");


/* ==============================
   2. GET SAVED ORDER
============================== */

const savedOrder = localStorage.getItem("faynexLastOrder");


/* ==============================
   3. DISPLAY ORDER INFORMATION
============================== */

if (savedOrder) {

    const order = JSON.parse(savedOrder);


    /* Display Order Number */

    if (orderNumberElement) {

        orderNumberElement.textContent =
            order.orderNumber
                ? "#" + order.orderNumber
                : "Not available";

    }


    /* Display Order Date */

    if (orderDateElement && order.orderDate) {

        const date = new Date(order.orderDate);

        orderDateElement.textContent = date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

    } else if (orderDateElement) {

        orderDateElement.textContent = "Not available";

    }


    /* Display Order Status */

    if (orderStatusElement) {

        orderStatusElement.textContent = order.status || "Pending";

    }

} else {

    /* No Order Found */

    if (orderNumberElement) {

        orderNumberElement.textContent = "Order not found";

    }

    if (orderDateElement) {

        orderDateElement.textContent = "Not available";

    }

    if (orderStatusElement) {

        orderStatusElement.textContent = "Not available";

    }

}
