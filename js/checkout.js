
/* ==============================
   1. CHECKOUT ELEMENTS
============================== */

const checkoutItems = document.getElementById("checkout-items");

const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutDiscountRow = document.getElementById("checkout-discount-row");
const checkoutDiscount = document.getElementById("checkout-discount");
const checkoutShipping = document.getElementById("checkout-shipping");
const checkoutTax = document.getElementById("checkout-tax");
const checkoutTotal = document.getElementById("checkout-total");


/* ==============================
   2. PRICE HELPERS
============================== */

function getCheckoutPrice(price) {
    return Number(
        String(price).replace(/[^0-9.-]/g, "")
    ) || 0;
}


function formatCheckoutPrice(price) {
    // Shared JOD format from main.js
    return formatCurrency(price);
}


/* ==============================
   3. DISPLAY ORDER SUMMARY
============================== */

function renderCheckout() {

    if (!checkoutItems) {
        return;
    }

    const cart = JSON.parse(
        localStorage.getItem("faynexCart") || "[]"
    );

    checkoutItems.innerHTML = "";


    /* Display Products */

    cart.forEach(function (product) {

        const price = getCheckoutPrice(product.price);

        const quantity = Math.max(
            1,
            Math.floor(Number(product.quantity) || 1)
        );

        const item = document.createElement("div");

        item.className = "summary-item checkout-product-item";


        const productInfo = document.createElement("div");

        productInfo.className = "checkout-product-info";


        const productName = document.createElement("span");

        productName.textContent = product.name || "Product";


        const productQuantity = document.createElement("small");

        productQuantity.textContent = `Qty: ${quantity}`;


        productInfo.appendChild(productName);
        productInfo.appendChild(productQuantity);


        const productPrice = document.createElement("span");

        productPrice.textContent = formatCheckoutPrice(
            price * quantity
        );


        item.appendChild(productInfo);
        item.appendChild(productPrice);

        checkoutItems.appendChild(item);


        /* Display Optional Product Details */

        if (product.color || product.storage) {

            const details = document.createElement("p");

            details.className = "checkout-product-details";

            details.textContent = [
                product.color ? `Color: ${product.color}` : "",
                product.storage ? `Storage: ${product.storage}` : ""
            ].filter(Boolean).join(" | ");

            checkoutItems.appendChild(details);

        }

    });


    /* Calculate Subtotal */

    const subtotal = cart.reduce(function (sum, product) {

        const price = getCheckoutPrice(product.price);

        const quantity = Math.max(
            1,
            Math.floor(Number(product.quantity) || 1)
        );

        return sum + price * quantity;

    }, 0);


    updateCheckoutSummary(subtotal);

}


/* ==============================
   4. UPDATE ORDER TOTALS
============================== */

function updateCheckoutSummary(subtotal) {

    const savedCoupon = localStorage.getItem("faynexCoupon");

    const discount = savedCoupon === "FAYNEX10"
        ? subtotal * 0.10
        : 0;

    const discountedSubtotal = subtotal - discount;

    const shipping = 0;

    const tax = discountedSubtotal * STORE_TAX_RATE;

    const total = discountedSubtotal + tax + shipping;


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatCheckoutPrice(subtotal);

    }


    if (checkoutDiscountRow && checkoutDiscount) {

        checkoutDiscountRow.hidden = discount === 0;

        checkoutDiscount.textContent =
            "-" + formatCheckoutPrice(discount);

    }


    if (checkoutShipping) {

        checkoutShipping.textContent =
            shipping === 0
                ? "Free"
                : formatCheckoutPrice(shipping);

    }


    if (checkoutTax) {

        checkoutTax.textContent =
            formatCheckoutPrice(tax);

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatCheckoutPrice(total);

    }

}


/* ==============================
   5. HANDLE PLACE ORDER
============================== */

const checkoutForm = document.getElementById("checkout-form");


if (checkoutForm) {

    checkoutForm.addEventListener("submit", function (event) {

        event.preventDefault();


        /* Validate Form */

        // Card number, expiry and CVV rules (section 7)
        validateCardFields();

        if (!checkoutForm.checkValidity()) {

            checkoutForm.reportValidity();

            return;

        }


        /* Get Current Cart */

        const cart = JSON.parse(
            localStorage.getItem("faynexCart") || "[]"
        );


        /* Check Stock (products.js) */

        const stockProblems = getStockProblems(cart);

        if (stockProblems.length > 0) {

            const problem = stockProblems[0];

            if (problem.unavailable) {

                showNotification(
                    `${problem.name} is no longer available. Please remove it from your cart.`,
                    "Product Not Available",
                    "error"
                );

                return;

            }

            showNotification(
                problem.stock === 0
                    ? `${problem.name} is out of stock. Please remove it from your cart.`
                    : `Only ${problem.stock} of ${problem.name} left in stock. Please lower the quantity.`,
                "Not Enough Stock",
                "error"
            );

            return;

        }


        /* Get Billing Information */

        const firstName = checkoutForm.querySelector(
            'input[placeholder="First Name"]'
        ).value.trim();

        const lastName = checkoutForm.querySelector(
            'input[placeholder="Last Name"]'
        ).value.trim();

        const email = checkoutForm.querySelector(
            'input[type="email"]'
        ).value.trim();

        const phone = checkoutForm.querySelector(
            "#phone"
        ).value.trim();


        /* Get Shipping Information */

        const country = checkoutForm.querySelector(
            "#country"
        ).value;

        const selects = checkoutForm.querySelectorAll("select");

        const governorate = selects[1].value;


        const addressInputs = checkoutForm.querySelectorAll(
            '.billing-card input[type="text"]'
        );

        const streetAddress = Array.from(addressInputs).find(
            input => input.placeholder === "Street Address"
        )?.value.trim() || "";

        const apartment = Array.from(addressInputs).find(
            input => input.placeholder.includes("Apartment")
        )?.value.trim() || "";

        const zipCode = Array.from(addressInputs).find(
            input => input.placeholder === "ZIP Code"
        )?.value.trim() || "";


        /* Get Payment Method */

        const selectedPayment = checkoutForm.querySelector(
            'input[name="payment"]:checked'
        );

        const paymentMethod = selectedPayment
            ? selectedPayment.parentElement.textContent.trim()
            : "Credit / Debit Card";


        /* Calculate Order Totals */

        const subtotal = cart.reduce(function (sum, product) {

            const price = getCheckoutPrice(product.price);

            const quantity = Math.max(
                1,
                Math.floor(Number(product.quantity) || 1)
            );

            return sum + price * quantity;

        }, 0);


        const savedCoupon = localStorage.getItem("faynexCoupon");

        const discount = savedCoupon === "FAYNEX10"
            ? subtotal * 0.10
            : 0;

        const discountedSubtotal = subtotal - discount;

        const shipping = 0;

        const tax = discountedSubtotal * STORE_TAX_RATE;

        const total = discountedSubtotal + tax + shipping;


        /* Round Amounts to 2 Decimals Before Saving */

        function roundPrice(value) {
            return Math.round(value * 100) / 100;
        }

        const roundedSubtotal = roundPrice(subtotal);
        const roundedDiscount = roundPrice(discount);
        const roundedTax = roundPrice(tax);
        const roundedTotal = roundPrice(roundedSubtotal - roundedDiscount + roundedTax + shipping);


        /* Link the Order to the Logged In User */

        const currentUser = getCurrentUser();


        /* Generate Sequential Order Number */

        const orderCounter =
            Number(localStorage.getItem("faynexOrderCounter") || 0) + 1;


        /* Create Order */

        const order = {

            orderNumber: "FYN-" + orderCounter,

            orderDate: new Date().toISOString(),

            userId: currentUser ? currentUser.id : null,

            customer: {
                firstName,
                lastName,
                email,
                phone
            },

            shippingAddress: {
                country,
                governorate,
                streetAddress,
                apartment,
                zipCode
            },

            paymentMethod,

            products: cart,

            subtotal: roundedSubtotal,
            discount: roundedDiscount,
            shipping,
            tax: roundedTax,
            total: roundedTotal,

            status: "Pending"

        };


        /* Save Order Counter */

        localStorage.setItem(
            "faynexOrderCounter",
            orderCounter
        );


        /* Save All Orders */

        const savedOrders = JSON.parse(
            localStorage.getItem("faynexOrders") || "[]"
        );


        /* Preserve the Previous Order if Needed */

        const previousOrderData = localStorage.getItem("faynexLastOrder");

        if (previousOrderData) {

            const previousOrder = JSON.parse(previousOrderData);

            const previousOrderExists = savedOrders.some(
                savedOrder =>
                    savedOrder.orderNumber === previousOrder.orderNumber
            );

            if (
                previousOrder.orderNumber &&
                !previousOrderExists
            ) {

                savedOrders.push(previousOrder);

            }

        }


        /* Add the New Order */

        savedOrders.push(order);


        /* Store the Orders List */

        localStorage.setItem(
            "faynexOrders",
            JSON.stringify(savedOrders)
        );


        /* Save Last Order for Confirmation Page */

        localStorage.setItem(
            "faynexLastOrder",
            JSON.stringify(order)
        );


        /* Take the Ordered Products From Stock (products.js) */

        changeProductsStock(cart, -1);


        /* Clear Cart and Coupon */

        localStorage.removeItem("faynexCart");
        localStorage.removeItem("faynexCoupon");


        /* Redirect to Confirmation Page */

        window.location.href = "order-complete.html";

    });

}


/* ==============================
   6. PAYMENT METHOD TOGGLE
============================== */

const paymentMethods = document.querySelectorAll(
    'input[name="payment"]'
);

const cardDetails = document.getElementById("card-details");

const cardholderName = document.getElementById("cardholder-name");
const cardNumber = document.getElementById("card-number");
const cardExpiry = document.getElementById("card-expiry");
const cardCVV = document.getElementById("card-cvv");


function updatePaymentMethod() {

    const selectedPayment = document.querySelector(
        'input[name="payment"]:checked'
    );

    const isCardPayment = selectedPayment?.value === "card";


    /* Show or hide card details */

    if (cardDetails) {

        cardDetails.hidden = !isCardPayment;

    }


    /* Update required fields */

    if (cardholderName) {
        cardholderName.required = isCardPayment;
    }

    if (cardNumber) {
        cardNumber.required = isCardPayment;
    }

    if (cardExpiry) {
        cardExpiry.required = isCardPayment;
    }

    if (cardCVV) {
        cardCVV.required = isCardPayment;
    }

}


/* Listen for payment method changes */

paymentMethods.forEach(function (method) {

    method.addEventListener("change", updatePaymentMethod);

});


/* Initialize selected payment method */

updatePaymentMethod();


/* ==============================
   7. CARD VALIDATION
   Demo only: the card is checked in the browser,
   no money is taken and the card is not saved.
============================== */

// Luhn check: the standard test that a card number is real-looking
function isValidCardNumber(digits) {

    if (!/^\d{13,16}$/.test(digits)) {
        return false;
    }

    let sum = 0;

    digits.split("").reverse().forEach(function (digit, index) {

        let value = Number(digit);

        if (index % 2 === 1) {
            value *= 2;

            if (value > 9) {
                value -= 9;
            }
        }

        sum += value;
    });

    return sum % 10 === 0;
}


// MM/YY, valid month, and not in the past
function isValidExpiry(value) {

    const match = /^(\d{2})\/(\d{2})$/.exec(value);

    if (!match) {
        return false;
    }

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);

    if (month < 1 || month > 12) {
        return false;
    }

    const today = new Date();

    // The card works until the end of its expiry month
    const endOfExpiryMonth = new Date(year, month, 1);

    return endOfExpiryMonth > today;
}


// Set a message on each card field that is wrong
function validateCardFields() {

    const isCardPayment =
        document.querySelector('input[name="payment"]:checked')?.value === "card";

    const fields = [cardholderName, cardNumber, cardExpiry, cardCVV];

    fields.forEach(field => field?.setCustomValidity(""));

    if (!isCardPayment) {
        return;
    }

    if (cardholderName && cardholderName.value.trim().length < 3) {
        cardholderName.setCustomValidity("Please enter the name on the card.");
    }

    if (cardNumber && !isValidCardNumber(cardNumber.value.replace(/\s/g, ""))) {
        cardNumber.setCustomValidity("Please enter a valid card number.");
    }

    if (cardExpiry && !isValidExpiry(cardExpiry.value)) {
        cardExpiry.setCustomValidity("Please enter a valid expiry date (MM/YY) that is not in the past.");
    }

    if (cardCVV && !/^\d{3,4}$/.test(cardCVV.value)) {
        cardCVV.setCustomValidity("The CVV is the 3 or 4 digits on the back of the card.");
    }
}


/* Format while typing */

// "4242424242424242" -> "4242 4242 4242 4242"
cardNumber?.addEventListener("input", function () {
    const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
    cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    cardNumber.setCustomValidity("");
});

// "1230" -> "12/30"
cardExpiry?.addEventListener("input", function () {
    const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    cardExpiry.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
    cardExpiry.setCustomValidity("");
});

// Numbers only
cardCVV?.addEventListener("input", function () {
    cardCVV.value = cardCVV.value.replace(/\D/g, "").slice(0, 4);
    cardCVV.setCustomValidity("");
});

cardholderName?.addEventListener("input", function () {
    cardholderName.setCustomValidity("");
});


/* ==============================
   8. FILL LOGGED IN USER DATA
============================== */

function fillCheckoutUserData() {

    const user = getCurrentUser();

    if (!user || !checkoutForm) {
        return;
    }

    const userFields = [
        { input: checkoutForm.querySelector('input[placeholder="First Name"]'), value: user.firstName },
        { input: checkoutForm.querySelector('input[placeholder="Last Name"]'), value: user.lastName },
        { input: checkoutForm.querySelector('input[type="email"]'), value: user.email },
        { input: checkoutForm.querySelector("#phone"), value: user.phone }
    ];

    // Fill only empty fields
    userFields.forEach(function (field) {
        if (field.input && !field.input.value && field.value) {
            field.input.value = field.value;
        }
    });
}


/* ==============================
   9. INITIALIZE CHECKOUT
============================== */

renderCheckout();
fillCheckoutUserData();
