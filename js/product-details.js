
/* ==================================================
   FAYNEX - PRODUCT DETAILS JAVASCRIPT
   Uses the products list from products.js
================================================== */


/* ==================================================
   1. LOAD PRODUCT
================================================== */

const IMAGES_PATH = "../images/";

const productParams = new URLSearchParams(window.location.search);
const productId = productParams.get("id");

// No id in the link: show the first product (old links still work)
const currentProduct = productId
    ? getProductById(productId)
    : getVisibleProducts()[0];


/* ==================================================
   2. SHOW PRODUCT DETAILS
================================================== */

function renderProductDetails(product) {

    document.title = "FAYNEX | " + product.name;

    // Breadcrumb
    document.getElementById("breadcrumb-product").textContent = product.name;

    // Main image
    const mainImage = document.querySelector(".main-image img");
    mainImage.src = getProductImageSrc(product, IMAGES_PATH);
    mainImage.alt = product.name;

    // Name, rating, price and description
    document.querySelector(".product-right h1").textContent = product.name;

    renderRatingSummary(document.querySelector(".product-right .product-rating"), product.id);

    // Price of the first storage size (or the normal price)
    updateDisplayedPrice(product.storage[0]);

    document.querySelector(".product-right .description").textContent =
        product.description;

    // Features
    const features = document.querySelector(".product-features");
    features.innerHTML = "";

    product.features.forEach(function (feature) {
        const featureText = document.createElement("p");
        featureText.textContent = "✔ " + feature;
        features.appendChild(featureText);
    });

    features.hidden = product.features.length === 0;

    renderColorOptions(product);
    renderStorageOptions(product);

    // Out of stock: the product can't be bought
    if (Number(product.stock) <= 0) {

        const addButton = document.querySelector(".add-cart-btn");
        const buyButton = document.querySelector(".buy-btn");

        addButton.disabled = true;
        addButton.textContent = "Out of Stock";
        buyButton.disabled = true;
    }
}


// Colors (hidden when the product has no colors)
function renderColorOptions(product) {

    const colorOption = document.getElementById("color-option");
    const colorContainer = colorOption.querySelector(".color-images");

    colorContainer.innerHTML = "";

    if (product.colors.length === 0) {
        colorOption.hidden = true;
        return;
    }

    colorOption.hidden = false;

    product.colors.forEach(function (color, index) {

        const colorImage = document.createElement("img");

        colorImage.src = getProductImageSrc(color, IMAGES_PATH);
        colorImage.alt = color.name;
        colorImage.dataset.color = color.name;
        colorImage.dataset.image = color.image;
        colorImage.tabIndex = 0;
        colorImage.setAttribute("role", "button");
        colorImage.setAttribute("aria-label", "Select " + color.name + " color");
        colorImage.setAttribute("aria-pressed", String(index === 0));

        if (index === 0) {
            colorImage.classList.add("selected");
        }

        colorContainer.appendChild(colorImage);
    });
}


// Storage (hidden when the product has no storage options)
function renderStorageOptions(product) {

    const storageOption = document.getElementById("storage-option");
    const storageContainer = storageOption.querySelector(".storage-buttons");

    storageContainer.innerHTML = "";

    if (product.storage.length === 0) {
        storageOption.hidden = true;
        return;
    }

    storageOption.hidden = false;

    product.storage.forEach(function (storage, index) {

        const storageButton = document.createElement("button");

        storageButton.type = "button";
        storageButton.dataset.storage = storage;
        storageButton.textContent = storage;
        storageButton.setAttribute("aria-pressed", String(index === 0));

        if (index === 0) {
            storageButton.classList.add("selected");
        }

        storageContainer.appendChild(storageButton);
    });
}


// Product not found
function renderProductNotFound() {

    document.title = "FAYNEX | Product Not Found";

    document.getElementById("breadcrumb-product").textContent = "Not Found";

    const detailsSection = document.querySelector(".product-details");

    detailsSection.innerHTML = `
        <div class="product-not-found">
            <i class="fa-solid fa-box-open"></i>
            <h1>Product Not Found</h1>
            <p>The product you are looking for does not exist.</p>
            <a href="shop.html">Back to Shop</a>
        </div>
    `;

    document.querySelector(".related-products").hidden = true;
}


/* ==================================================
   3. RELATED PRODUCTS
================================================== */

function renderRelatedProducts(product) {

    const relatedContainer = document.getElementById("related-container");

    relatedContainer.innerHTML = "";

    getRelatedProducts(product).forEach(function (relatedProduct) {

        const card = document.createElement("a");
        card.className = "related-card";
        card.href = "product-details.html?id=" + relatedProduct.id;

        const image = document.createElement("img");
        image.src = getProductImageSrc(relatedProduct, IMAGES_PATH);
        image.alt = relatedProduct.name;

        const name = document.createElement("h3");
        name.textContent = relatedProduct.name;

        const price = document.createElement("p");
        price.textContent = formatCurrency(relatedProduct.price, 0);

        card.append(image, name, price);
        relatedContainer.appendChild(card);
    });
}


/* ==================================================
   4. COLOR SELECTION
================================================== */

function initializeColorSelection() {

    const colorImages = document.querySelectorAll(".color-images img");
    const mainProductImage = document.querySelector(".main-image img");

    colorImages.forEach(function (image) {

        function selectColor() {

            // Update selected color
            colorImages.forEach(function (img) {
                img.classList.remove("selected");
                img.setAttribute("aria-pressed", "false");
            });

            image.classList.add("selected");
            image.setAttribute("aria-pressed", "true");

            // Update main product image
            mainProductImage.src = getProductImageSrc({ image: image.dataset.image }, IMAGES_PATH);
            mainProductImage.alt = currentProduct.name + " - " + image.dataset.color;
        }

        // Mouse click
        image.addEventListener("click", selectColor);

        // Keyboard support
        image.addEventListener("keydown", function (event) {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectColor();
            }

        });

    });
}


/* ==================================================
   5. STORAGE SELECTION
================================================== */

function initializeStorageSelection() {

    const storageButtons = document.querySelectorAll(".storage-buttons button");

    storageButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            storageButtons.forEach(function (btn) {
                btn.classList.remove("selected");
                btn.setAttribute("aria-pressed", "false");
            });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");

            // Bigger storage = different price
            updateDisplayedPrice(button.dataset.storage);

        });

    });
}

// Show the price of the selected storage size
function updateDisplayedPrice(storageSize) {
    document.querySelector(".product-right .price").textContent =
        formatCurrency(getStoragePrice(currentProduct, storageSize), 0);
}


/* ==================================================
   6. QUANTITY CONTROLS
================================================== */

const quantityInput = document.querySelector(".quantity-input");
const decreaseButton = document.querySelector(".decrease-quantity");
const increaseButton = document.querySelector(".increase-quantity");

function initializeQuantityControls() {

    if (!quantityInput || !decreaseButton || !increaseButton) {
        return;
    }

    decreaseButton.addEventListener("click", function () {

        let quantity = parseInt(quantityInput.value, 10);

        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }

        quantityInput.value = Math.max(1, quantity - 1);

    });

    increaseButton.addEventListener("click", function () {

        let quantity = parseInt(quantityInput.value, 10);

        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }

        quantityInput.value = quantity + 1;

    });

    quantityInput.addEventListener("change", function () {

        let quantity = Number(quantityInput.value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            quantity = 1;
        }

        quantityInput.value = quantity;

    });
}


/* ==================================================
   7. ADD TO CART
   Uses shared functions from main.js
================================================== */

// Returns true when the product was added
function addCurrentProductToCart() {

    const selectedColorImage = document.querySelector(".color-images img.selected");
    const selectedStorage = document.querySelector(".storage-buttons button.selected")
        ?.dataset.storage;

    const quantity = Number(quantityInput?.value);

    // Color and storage are required only if the product has them
    const needsColor = currentProduct.colors.length > 0;
    const needsStorage = currentProduct.storage.length > 0;

    if (
        (needsColor && !selectedColorImage) ||
        (needsStorage && !selectedStorage) ||
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        showNotification(
            "Please check your product options and quantity.",
            "Invalid Product Selection",
            "error"
        );

        return false;
    }

    const selectedColor = selectedColorImage?.dataset.color;

    const productImage = selectedColorImage
        ? getProductImageSrc({ image: selectedColorImage.dataset.image }, IMAGES_PATH)
        : getProductImageSrc(currentProduct, IMAGES_PATH);

    // Get the existing shared cart
    const cart = getCart();

    // Match product name, color, and storage
    const existingProduct = cart.find(function (product) {

        return (
            product.name === currentProduct.name &&
            product.color === selectedColor &&
            product.storage === selectedStorage
        );

    });

    if (existingProduct) {

        existingProduct.quantity += quantity;

    } else {

        const newCartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: getStoragePrice(currentProduct, selectedStorage),
            image: productImage,
            quantity: quantity
        };

        if (selectedColor) {
            newCartItem.color = selectedColor;
        }

        if (selectedStorage) {
            newCartItem.storage = selectedStorage;
        }

        cart.push(newCartItem);
    }

    // Save using the shared cart function
    saveCart(cart);

    showNotification(
        currentProduct.name + " added to your cart.",
        "Added to Cart"
    );

    return true;
}


const addCartButton = document.querySelector(".add-cart-btn");

if (addCartButton) {

    addCartButton.addEventListener("click", function () {
        addCurrentProductToCart();
    });

}


/* ==================================================
   8. BUY NOW
================================================== */

const buyNowButton = document.querySelector(".buy-btn");

if (buyNowButton) {

    buyNowButton.addEventListener("click", function () {

        // Go to the cart only if the product was added
        if (addCurrentProductToCart()) {
            window.location.assign("cart.html");
        }

    });

}


/* ==================================================
   9. PRODUCT REVIEWS
   Uses review functions from products.js
================================================== */

let selectedReviewRating = 0;


// Rating summary and the list of reviews
function renderReviews() {

    const summary = getProductRatingSummary(currentProduct.id);
    const reviews = getProductReviews(currentProduct.id);
    const currentUser = getCurrentUser();

    document.getElementById("reviews-average").textContent = summary.average.toFixed(1);
    document.getElementById("reviews-stars").textContent = getStarsText(summary.average);
    document.getElementById("reviews-count").textContent = summary.count
        ? `Based on ${summary.count} ${summary.count === 1 ? "review" : "reviews"}`
        : "No reviews yet. Be the first to review this product.";

    // Stars next to the product name
    renderRatingSummary(document.querySelector(".product-right .product-rating"), currentProduct.id);

    const reviewsList = document.getElementById("reviews-list");
    reviewsList.innerHTML = "";

    reviews.forEach(function (review) {

        const item = document.createElement("article");
        item.className = "review-item";

        const header = document.createElement("div");
        header.className = "review-header";

        const name = document.createElement("strong");
        name.textContent = review.userName;

        const stars = document.createElement("span");
        stars.className = "stars";
        stars.textContent = getStarsText(review.rating);

        header.append(name, stars);

        // Customer bought this product
        if (review.verified) {
            const badge = document.createElement("span");
            badge.className = "verified-badge";
            badge.textContent = "Verified Purchase";
            header.appendChild(badge);
        }

        const date = document.createElement("small");
        date.textContent = new Date(review.date).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        });

        const comment = document.createElement("p");
        comment.textContent = review.comment;

        item.append(header, date, comment);

        if (currentUser && review.userId === currentUser.id) {
            item.classList.add("my-review");
        }

        reviewsList.appendChild(item);
    });
}


// Show the form for logged in customers, a message for guests
function renderReviewForm() {

    const currentUser = getCurrentUser();
    const reviewForm = document.getElementById("review-form");

    document.getElementById("review-login-note").hidden = Boolean(currentUser);
    reviewForm.hidden = !currentUser;

    if (!currentUser) {
        return;
    }

    // One review per customer: edit it if it already exists
    const myReview = getAllReviews().find(function (review) {
        return review.productId === currentProduct.id && review.userId === currentUser.id;
    });

    document.getElementById("review-form-title").textContent = myReview ? "Edit Your Review" : "Write a Review";
    document.getElementById("review-submit-btn").textContent = myReview ? "Update Review" : "Submit Review";
    document.getElementById("review-delete-btn").hidden = !myReview;
    document.getElementById("review-comment").value = myReview ? myReview.comment : "";

    setReviewRating(myReview ? myReview.rating : 0);
}


// Color the stars of the rating input
function setReviewRating(rating) {

    selectedReviewRating = rating;

    document.querySelectorAll("#star-input button").forEach(function (button) {
        const value = Number(button.dataset.value);

        button.classList.toggle("active", value <= rating);
        button.setAttribute("aria-checked", String(value === rating));
    });
}


// Did this customer order this product?
function hasCustomerBoughtProduct(user) {
    return getUserOrders(user).some(function (order) {
        return getOrderStatusName(order) !== "cancelled" && (order.products || []).some(function (item) {
            return item.id === currentProduct.id || item.name === currentProduct.name;
        });
    });
}

function getOrderStatusName(order) {
    return String(order.status || "pending").toLowerCase();
}


function initializeReviews() {

    document.querySelectorAll("#star-input button").forEach(function (button) {
        button.addEventListener("click", function () {
            setReviewRating(Number(button.dataset.value));
        });
    });

    // Save review
    document.getElementById("review-form").addEventListener("submit", function (event) {

        event.preventDefault();

        const currentUser = getCurrentUser();
        const commentInput = document.getElementById("review-comment");
        const comment = commentInput.value.trim();

        if (!currentUser) {
            return;
        }

        if (!selectedReviewRating) {
            showNotification("Please choose a rating from 1 to 5 stars.", "Rating Required", "error");
            return;
        }

        if (comment.length < 5) {
            showNotification("Please write at least 5 characters.", "Review Too Short", "error");
            commentInput.focus();
            return;
        }

        const reviews = getAllReviews().filter(function (review) {
            return !(review.productId === currentProduct.id && review.userId === currentUser.id);
        });

        const isUpdate = reviews.length < getAllReviews().length;

        reviews.push({
            id: "REV-" + Date.now(),
            productId: currentProduct.id,
            userId: currentUser.id,
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            rating: selectedReviewRating,
            comment,
            verified: hasCustomerBoughtProduct(currentUser),
            date: new Date().toISOString()
        });

        saveAllReviews(reviews);

        renderReviews();
        renderReviewForm();

        showNotification(
            isUpdate ? "Your review has been updated." : "Thank you for your review!",
            isUpdate ? "Review Updated" : "Review Added"
        );
    });

    // Delete my review
    document.getElementById("review-delete-btn").addEventListener("click", function () {

        const currentUser = getCurrentUser();

        if (!currentUser) {
            return;
        }

        const reviews = getAllReviews().filter(function (review) {
            return !(review.productId === currentProduct.id && review.userId === currentUser.id);
        });

        saveAllReviews(reviews);

        renderReviews();
        renderReviewForm();

        showNotification("Your review has been deleted.", "Review Deleted");
    });
}


/* ==================================================
   10. INITIALIZE PRODUCT PAGE
================================================== */

if (currentProduct) {

    renderProductDetails(currentProduct);
    renderRelatedProducts(currentProduct);

    initializeColorSelection();
    initializeStorageSelection();
    initializeQuantityControls();

    renderReviews();
    renderReviewForm();
    initializeReviews();

} else {

    renderProductNotFound();

    const reviewsSection = document.getElementById("product-reviews");

    if (reviewsSection) {
        reviewsSection.hidden = true;
    }

}
