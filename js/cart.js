
/* ==============================
   1. CART ELEMENTS
============================== */

const cartItemsBody = document.getElementById("cart-items-body");

const subtotalElement = document.getElementById("cart-subtotal");
const shippingElement = document.getElementById("cart-shipping");
const taxElement = document.getElementById("cart-tax");
const totalElement = document.getElementById("cart-total");


/* ==============================
   2. COUPON ELEMENTS
============================== */

let appliedCoupon = null;

const couponInput = document.getElementById("coupon-code");
const applyCouponButton = document.getElementById("apply-coupon");
const couponMessage = document.getElementById("coupon-message");
const discountRow = document.getElementById("discount-row");
const discountElement = document.getElementById("cart-discount");


/* ==============================
   3. CHECKOUT BUTTON
============================== */

const checkoutButton = document.getElementById("checkout-btn");


function updateCheckoutButton() {

    if (!checkoutButton) {
        return;
    }

    const cart = getCart();
    const isEmpty = cart.length === 0;

    checkoutButton.classList.toggle("disabled", isEmpty);

    checkoutButton.setAttribute(
        "aria-disabled",
        String(isEmpty)
    );

    if (isEmpty) {
        checkoutButton.removeAttribute("href");
    } else {
        checkoutButton.setAttribute("href", "checkout.html");
    }

}


/* ==============================
   4. PRICE HELPERS
============================== */

function getPriceValue(price) {

    return Number(
        String(price).replace(/[^0-9.-]/g, "")
    ) || 0;

}


function formatPrice(price) {

    // Shared JOD format from main.js
    return formatCurrency(price);

}


// Most this row can have: the product stock minus the same
// product in other rows (different color/storage). null = no limit known.
function getMaxQuantity(cart, index) {

    if (typeof getStoreProducts !== "function") {
        return null;
    }

    const item = cart[index];

    const product = getStoreProducts().find(
        p => p.id === item.id || p.name === item.name
    );

    if (!product) {
        return null;
    }

    const inOtherRows = cart.reduce(function (sum, other, otherIndex) {

        const sameProduct = other.id
            ? other.id === product.id
            : other.name === product.name;

        return otherIndex !== index && sameProduct
            ? sum + (Number(other.quantity) || 1)
            : sum;

    }, 0);

    return Math.max(1, (Number(product.stock) || 0) - inOtherRows);

}


/* ==============================
   5. DISPLAY CART PRODUCTS
============================== */

function renderCart() {

    if (!cartItemsBody) {
        return;
    }

    const cart = getCart();

    // Update checkout button immediately
    updateCheckoutButton();

    cartItemsBody.innerHTML = "";


    /* Empty Cart */

    if (cart.length === 0) {

        cartItemsBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cart">

                    <div class="empty-cart-content">

                        <i class="fa-solid fa-cart-shopping"></i>

                        <h3>Your Cart Is Empty</h3>

                        <p>
                            Looks like you haven't added anything
                            to your cart yet.
                        </p>

                        <a href="shop.html" class="continue-btn">
                            Continue Shopping
                        </a>

                    </div>

                </td>
            </tr>
        `;

        updateCartSummary(0);

        return;
    }


    /* Display Products */

    cart.forEach((product, index) => {

        const price = getPriceValue(product.price);

        const quantity = Math.max(
            1,
            Math.floor(Number(product.quantity) || 1)
        );

        const maxQuantity = getMaxQuantity(cart, index);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="cart-product">

                    <img
                        src=""
                        alt=""
                        class="cart-product-image"
                    >

                    <div class="cart-product-info">

                        <h3></h3>

                        ${
                            product.color
                                ? `<p class="product-color"></p>`
                                : ""
                        }

                        ${
                            product.storage
                                ? `<p class="product-storage"></p>`
                                : ""
                        }

                    </div>

                </div>
            </td>

            <td>${formatPrice(price)}</td>

            <td>
                <input
                    type="number"
                    class="cart-quantity"
                    data-index="${index}"
                    value="${quantity}"
                    min="1"
                    ${maxQuantity !== null ? `max="${maxQuantity}"` : ""}
                    step="1"
                    aria-label="Product quantity"
                >
            </td>

            <td>${formatPrice(price * quantity)}</td>

            <td>
                <button
                    type="button"
                    class="remove-btn"
                    data-index="${index}"
                    aria-label="Remove product"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;


        const productImage = row.querySelector(
            ".cart-product-image"
        );

        productImage.src = product.image || "";
        productImage.alt = product.name || "Product";


        row.querySelector(
            ".cart-product-info h3"
        ).textContent = product.name || "Product";


        const colorElement = row.querySelector(".product-color");

        if (colorElement) {
            colorElement.textContent = `Color: ${product.color}`;
        }


        const storageElement = row.querySelector(".product-storage");

        if (storageElement) {
            storageElement.textContent = `Storage: ${product.storage}`;
        }


        cartItemsBody.appendChild(row);

    });


    /* Calculate Subtotal */

    const subtotal = cart.reduce((sum, product) => {

        const price = getPriceValue(product.price);

        const quantity = Math.max(
            1,
            Math.floor(Number(product.quantity) || 1)
        );

        return sum + price * quantity;

    }, 0);


    updateCartSummary(subtotal);

}


/* ==============================
   6. UPDATE ORDER SUMMARY
============================== */

function updateCartSummary(subtotal) {

    const discount = appliedCoupon === "FAYNEX10"
        ? subtotal * 0.10
        : 0;

    const discountedSubtotal = subtotal - discount;

    const shipping = 0;

    const tax = discountedSubtotal * STORE_TAX_RATE;

    const total = discountedSubtotal + tax + shipping;


    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }


    if (shippingElement) {

        shippingElement.textContent =
            shipping === 0
                ? "Free"
                : formatPrice(shipping);

    }


    if (taxElement) {
        taxElement.textContent = formatPrice(tax);
    }


    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }


    if (discountRow && discountElement) {

        discountRow.hidden = discount === 0;

        discountElement.textContent =
            "-" + formatPrice(discount);

    }

}


/* ==============================
   7. CHANGE PRODUCT QUANTITY
============================== */

if (cartItemsBody) {

    cartItemsBody.addEventListener("change", function (event) {

        if (!event.target.classList.contains("cart-quantity")) {
            return;
        }


        const index = Number(event.target.dataset.index);

        let quantity = Math.max(
            1,
            Math.floor(Number(event.target.value) || 1)
        );


        const cart = getCart();

        if (!cart[index]) {
            return;
        }


        // Don't allow more than the available stock
        const maxQuantity = getMaxQuantity(cart, index);

        if (maxQuantity !== null && quantity > maxQuantity) {

            quantity = maxQuantity;

            showNotification(
                `Only ${maxQuantity} available for ${cart[index].name}.`,
                "Limited Stock",
                "error"
            );

        }


        cart[index].quantity = quantity;

        saveCart(cart);

        renderCart();

    });


    /* ==============================
       8. REMOVE PRODUCT
    ============================== */

    cartItemsBody.addEventListener("click", function (event) {

        const removeButton = event.target.closest(".remove-btn");

        if (!removeButton) {
            return;
        }


        const index = Number(removeButton.dataset.index);

        const cart = getCart();

        if (!cart[index]) {
            return;
        }


        cart.splice(index, 1);

        saveCart(cart);

        renderCart();


        if (typeof showNotification === "function") {

            showNotification(
                "Product removed from your cart."
            );

        }

    });

}


/* ==============================
   9. APPLY COUPON
============================== */

function applyCoupon() {

    if (!couponInput || !couponMessage) {
        return;
    }


    const code = couponInput.value.trim().toUpperCase();


    if (code === "FAYNEX10") {

        appliedCoupon = "FAYNEX10";

        localStorage.setItem(
            "faynexCoupon",
            appliedCoupon
        );


        couponMessage.textContent =
            "Coupon applied! You saved 10%.";

        couponMessage.style.color = "#16A34A";

    } else {

        appliedCoupon = null;

        localStorage.removeItem("faynexCoupon");


        couponMessage.textContent = code
            ? "Invalid coupon code."
            : "Please enter a coupon code.";

        couponMessage.style.color = "#DC2626";

    }


    renderCart();

}


if (applyCouponButton) {

    applyCouponButton.addEventListener(
        "click",
        applyCoupon
    );

}


if (couponInput) {

    couponInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            applyCoupon();

        }

    });

}


/* ==============================
   10. RESTORE SAVED COUPON
============================== */

const savedCoupon = localStorage.getItem("faynexCoupon");


if (savedCoupon === "FAYNEX10") {

    appliedCoupon = savedCoupon;


    if (couponInput) {
        couponInput.value = savedCoupon;
    }


    if (couponMessage) {

        couponMessage.textContent =
            "Coupon applied! You saved 10%.";

        couponMessage.style.color = "#16A34A";

    }

} else {

    localStorage.removeItem("faynexCoupon");

}


/* ==============================
   11. CLEAR COUPON
============================== */

const clearCouponButton = document.getElementById("clear-coupon");


if (clearCouponButton) {

    clearCouponButton.addEventListener("click", function () {

        appliedCoupon = null;

        localStorage.removeItem("faynexCoupon");


        if (couponInput) {
            couponInput.value = "";
        }


        if (couponMessage) {
            couponMessage.textContent = "";
        }


        renderCart();

    });

}


/* ==============================
   12. INITIALIZE CART
============================== */

renderCart();
