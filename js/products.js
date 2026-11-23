
/* ==================================================
   FAYNEX - PRODUCTS CATALOG
   One place for all product information.
   Images are file names inside the images folder.
================================================== */


/* ==============================
   1. PRODUCTS LIST
============================== */

const FAYNEX_PRODUCTS = [

    {
        id: "iphone-17-pro-max",
        name: "iPhone 17 Pro Max",
        category: "smartphones",
        categoryName: "Smartphones",
        price: 1099,
        image: "iphone17proMax.jpg",
        description:
            "Experience the iPhone 17 Pro Max with the powerful A19 Pro chip, " +
            "advanced triple-camera system, titanium design, and an immersive " +
            "Super Retina XDR display. Built for performance, creativity, and all-day battery life.",
        features: [
            "A19 Pro Chip",
            "6.9-inch Super Retina XDR Display",
            "Triple 48MP Camera System",
            "Titanium Design",
            "Face ID & 5G"
        ],
        colors: [
            { name: "Silver", image: "iphone17proMaxSilver.jpg" },
            { name: "Black", image: "iphone17proMaxBlack.jpg" },
            { name: "Blue", image: "iphone17proMaxBlue.jpg" },
            { name: "Gold", image: "iphone17proMaxGold.jpg" }
        ],
        storage: ["256GB", "512GB", "1TB"],
        // Price for each storage size (JOD)
        storagePrices: { "256GB": 1099, "512GB": 1299, "1TB": 1499 }
    },

    {
        id: "samsung-galaxy-s26",
        name: "Samsung Galaxy S26",
        category: "smartphones",
        categoryName: "Smartphones",
        price: 699,
        image: "SamsungGalaxyS26.jpg",
        description:
            "The Samsung Galaxy S26 combines a bright AMOLED display, a fast processor, " +
            "and a versatile camera system in a slim design made for everyday use.",
        features: [
            "Dynamic AMOLED 2X Display",
            "Triple Camera System",
            "Long-lasting Battery",
            "Fast Wireless Charging",
            "5G Connectivity"
        ],
        colors: [],
        storage: ["256GB", "512GB"],
        // Price for each storage size (JOD)
        storagePrices: { "256GB": 699, "512GB": 789 }
    },

    {
        id: "macbook-pro-m5",
        name: "MacBook Pro M5",
        category: "laptops",
        categoryName: "Laptops",
        price: 1399,
        image: "MacBookProM5.jpg",
        description:
            "MacBook Pro with the M5 chip delivers fast performance for work, design, " +
            "and development, with a stunning Liquid Retina XDR display and all-day battery life.",
        features: [
            "Apple M5 Chip",
            "Liquid Retina XDR Display",
            "All-day Battery Life",
            "Studio-quality Microphones",
            "Thunderbolt Ports"
        ],
        colors: [],
        storage: ["512GB", "1TB", "2TB"],
        // Price for each storage size (JOD)
        storagePrices: { "512GB": 1399, "1TB": 1599, "2TB": 1899 }
    },

    {
        id: "asus-rog-strix",
        name: "ASUS ROG Strix",
        category: "gaming",
        categoryName: "Gaming",
        price: 1299,
        image: "ASUS-ROG-Strix.jpg",
        description:
            "The ASUS ROG Strix gaming laptop is built for smooth gameplay, with a " +
            "high refresh rate display, powerful graphics, and an advanced cooling system.",
        features: [
            "High Refresh Rate Display",
            "Dedicated Gaming Graphics",
            "RGB Backlit Keyboard",
            "Advanced Cooling System",
            "Wi-Fi 6E"
        ],
        colors: [],
        storage: ["1TB", "2TB"],
        // Price for each storage size (JOD)
        storagePrices: { "1TB": 1299, "2TB": 1449 }
    },

    {
        id: "apple-watch-ultra",
        name: "Apple Watch Ultra",
        category: "smart-watches",
        categoryName: "Smart Watches",
        price: 649,
        image: "Apple-Watch-Ultra.jpg",
        description:
            "Apple Watch Ultra is made for adventure, with a rugged titanium case, " +
            "a bright display, precise GPS, and advanced health and fitness tracking.",
        features: [
            "Rugged Titanium Case",
            "Always-On Bright Display",
            "Precision Dual-frequency GPS",
            "Health & Fitness Tracking",
            "Water Resistant"
        ],
        colors: [],
        storage: []
    },

    {
        id: "sony-wh-1000xm6",
        name: "Sony WH-1000XM6",
        category: "accessories",
        categoryName: "Accessories",
        price: 299,
        image: "Sony-WH-1000XM6.jpg",
        description:
            "Sony WH-1000XM6 wireless headphones offer industry-leading noise cancellation, " +
            "rich sound, and a comfortable design for long listening sessions.",
        features: [
            "Industry-leading Noise Cancellation",
            "High-Resolution Audio",
            "Long Battery Life",
            "Quick Charging",
            "Comfortable Lightweight Design"
        ],
        colors: [],
        storage: []
    },

    {
        id: "playstation-6",
        name: "PlayStation 6",
        category: "gaming",
        categoryName: "Gaming",
        price: 549,
        image: "PlayStation6.jpg",
        description:
            "PlayStation 6 brings next-generation gaming with fast loading, " +
            "stunning graphics, and an immersive wireless controller.",
        features: [
            "Ultra-fast SSD",
            "4K Gaming Graphics",
            "Ray Tracing Support",
            "Wireless Controller",
            "3D Audio"
        ],
        colors: [],
        storage: []
    },

    {
        id: "samsung-oled-tv",
        name: "Samsung OLED TV",
        category: "tvs",
        categoryName: "TVs",
        price: 1199,
        image: "Samsung-OLED-TV.jpg",
        description:
            "Samsung OLED TV delivers deep blacks, vivid colors, and smart features " +
            "for an amazing home entertainment experience.",
        features: [
            "4K OLED Display",
            "HDR Support",
            "Smart TV Apps",
            "Dolby Atmos Sound",
            "Slim Modern Design"
        ],
        colors: [],
        storage: []
    }

];


/* ==============================
   2. CATEGORIES LIST
============================== */

const FAYNEX_CATEGORIES = [
    { id: "smartphones", name: "Smartphones", icon: "fa-mobile-screen" },
    { id: "laptops", name: "Laptops", icon: "fa-laptop" },
    { id: "tvs", name: "TVs", icon: "fa-tv" },
    { id: "smart-watches", name: "Smart Watches", icon: "fa-clock" },
    { id: "accessories", name: "Accessories", icon: "fa-headphones" },
    { id: "gaming", name: "Gaming", icon: "fa-gamepad" }
];

// Get a category name from its id
function getCategoryName(categoryId) {
    const category = FAYNEX_CATEGORIES.find(function (item) {
        return item.id === categoryId;
    });

    return category ? category.name : categoryId;
}


/* ==============================
   3. PRODUCTS STORE
   The admin can change products, so the list is saved
   in localStorage ("faynexProducts"). The first time,
   it starts from FAYNEX_PRODUCTS above.
============================== */

// Add the admin fields to a product
function completeProductData(product, index) {
    return {
        brand: "",
        sku: "SKU-" + String(1001 + index),
        stock: 20,
        status: "Active",
        createdAt: "2026-10-" + String(10 + index).padStart(2, "0"),
        colors: [],
        storage: [],
        features: [],
        ...product
    };
}

// Change this number when FAYNEX_PRODUCTS changes (e.g. new prices),
// so browsers with an old saved list get the new data.
const PRODUCTS_DATA_VERSION = "2";

// Get all products (saved list or the default list)
function getStoreProducts() {

    const defaultProducts = FAYNEX_PRODUCTS.map(completeProductData);

    let savedProducts = null;

    try {
        savedProducts = JSON.parse(localStorage.getItem("faynexProducts") || "null");
    } catch (error) {
        savedProducts = null;
    }

    if (!Array.isArray(savedProducts)) {
        return defaultProducts;
    }

    // Old saved data: use the new default products,
    // but keep the products the admin added
    if (localStorage.getItem("faynexProductsVersion") !== PRODUCTS_DATA_VERSION) {

        const defaultIds = defaultProducts.map(product => product.id);

        const adminProducts = savedProducts.filter(function (product) {
            return !defaultIds.includes(product.id);
        });

        const updatedProducts = defaultProducts.concat(adminProducts);

        saveStoreProducts(updatedProducts);

        return updatedProducts;
    }

    return savedProducts;
}

// Save all products
function saveStoreProducts(products) {
    localStorage.setItem("faynexProducts", JSON.stringify(products));
    localStorage.setItem("faynexProductsVersion", PRODUCTS_DATA_VERSION);
}

// Products customers can see (Active only)
function getVisibleProducts() {
    return getStoreProducts().filter(function (product) {
        return product.status !== "Hidden";
    });
}

// Image path: uploaded images are saved as data, others are files
function getProductImageSrc(product, imagesPath) {
    return String(product.image || "").startsWith("data:")
        ? product.image
        : imagesPath + product.image;
}


/* ==============================
   4. PRODUCT HELPERS
============================== */

// Find a product by its id
function getProductById(productId) {
    return getVisibleProducts().find(function (product) {
        return product.id === productId;
    });
}

// Get products from the same category (without the current product)
function getRelatedProducts(product, limit = 4) {

    const products = getVisibleProducts();

    const sameCategory = products.filter(function (item) {
        return item.category === product.category && item.id !== product.id;
    });

    const otherProducts = products.filter(function (item) {
        return item.category !== product.category;
    });

    return sameCategory.concat(otherProducts).slice(0, limit);
}

// Price of a storage size (or the normal price)
function getStoragePrice(product, storageSize) {
    const storagePrice = product.storagePrices?.[storageSize];

    return Number.isFinite(Number(storagePrice)) && storagePrice !== undefined
        ? Number(storagePrice)
        : Number(product.price);
}


/* ==============================
   5. PRODUCT REVIEWS
   Saved in localStorage ("faynexReviews").
   Ratings are calculated from real reviews only.
============================== */

function getAllReviews() {
    try {
        const reviews = JSON.parse(localStorage.getItem("faynexReviews") || "[]");
        return Array.isArray(reviews) ? reviews : [];
    } catch (error) {
        return [];
    }
}

function saveAllReviews(reviews) {
    localStorage.setItem("faynexReviews", JSON.stringify(reviews));
}

// Reviews of one product, newest first
function getProductReviews(productId) {
    return getAllReviews()
        .filter(review => review.productId === productId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// { average: 4.5, count: 2 }
function getProductRatingSummary(productId) {

    const reviews = getProductReviews(productId);

    if (reviews.length === 0) {
        return { average: 0, count: 0 };
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);

    return {
        average: Math.round((total / reviews.length) * 10) / 10,
        count: reviews.length
    };
}

// 4 -> "★★★★☆"
function getStarsText(rating) {
    const fullStars = Math.round(Number(rating) || 0);

    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
}

// Fill a .product-rating element with stars and the reviews count
function renderRatingSummary(element, productId) {

    const summary = getProductRatingSummary(productId);

    element.innerHTML = "";

    const stars = document.createElement("span");
    stars.className = "stars";
    stars.textContent = getStarsText(summary.average);

    const count = document.createElement("span");
    count.textContent = summary.count
        ? ` ${summary.average} (${summary.count} ${summary.count === 1 ? "Review" : "Reviews"})`
        : " No reviews yet";

    element.append(stars, count);
}


/* ==============================
   6. PRODUCT STOCK
   Checkout takes items from the stock,
   a cancelled order gives them back.
============================== */

// direction: -1 = take from stock, +1 = give back
function changeProductsStock(orderProducts, direction) {

    const products = getStoreProducts();

    (orderProducts || []).forEach(function (item) {

        const product = products.find(function (storeProduct) {
            return storeProduct.id === item.id || storeProduct.name === item.name;
        });

        if (!product) {
            return;
        }

        const quantity = Number(item.quantity) || 1;

        product.stock = Math.max(0, (Number(product.stock) || 0) + direction * quantity);
    });

    saveStoreProducts(products);
}

// Products in the cart that don't have enough stock
function getStockProblems(cartItems) {

    const products = getStoreProducts();
    const neededByProduct = {};
    const unavailableProducts = [];

    // The same product can be in the cart more than once (different colors)
    (cartItems || []).forEach(function (item) {

        const product = products.find(p => p.id === item.id || p.name === item.name);

        // Deleted or hidden by the admin: can't be bought anymore
        if (!product || product.status === "Hidden") {

            if (!unavailableProducts.some(problem => problem.name === item.name)) {
                unavailableProducts.push({ name: item.name || "A product", unavailable: true });
            }

            return;
        }

        neededByProduct[product.id] = (neededByProduct[product.id] || 0) + (Number(item.quantity) || 1);
    });

    const stockProblems = Object.entries(neededByProduct)
        .map(function ([productId, needed]) {
            const product = products.find(p => p.id === productId);
            return { name: product.name, needed, stock: Number(product.stock) || 0 };
        })
        .filter(problem => problem.needed > problem.stock);

    return unavailableProducts.concat(stockProblems);
}


/* ==============================
   7. PRODUCT CARDS (Home & Shop)
   Containers with data-store-products are filled
   from the products store, so admin changes appear.
============================== */

function createProductCard(product, detailsPath, imagesPath) {

    const link = detailsPath + "?id=" + encodeURIComponent(product.id);
    const isOutOfStock = Number(product.stock) <= 0;

    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.category = product.category;
    card.dataset.date = product.createdAt || "";
    card.dataset.rating = getProductRatingSummary(product.id).average;


    /* Image */

    const imageBox = document.createElement("div");
    imageBox.className = "product-image";

    const imageLink = document.createElement("a");
    imageLink.href = link;

    const image = document.createElement("img");
    image.src = getProductImageSrc(product, imagesPath);
    image.alt = product.name;

    imageLink.appendChild(image);
    imageBox.appendChild(imageLink);


    /* Information */

    const info = document.createElement("div");
    info.className = "product-info";

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = link;
    titleLink.textContent = product.name;
    title.appendChild(titleLink);

    const rating = document.createElement("div");
    rating.className = "product-rating";
    renderRatingSummary(rating, product.id);

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = formatCurrency(product.price, 0);


    /* Buttons */

    const buttons = document.createElement("div");
    buttons.className = "product-buttons";

    const cartButton = document.createElement("button");
    cartButton.className = "cart-btn";
    cartButton.textContent = isOutOfStock ? "Out of Stock" : "Add to Cart";
    cartButton.disabled = isOutOfStock;

    // Colors or storage must be chosen on the product page first
    const hasOptions = (product.colors || []).length > 0 || (product.storage || []).length > 0;

    if (hasOptions && !isOutOfStock) {
        cartButton.textContent = "Choose Options";
        cartButton.dataset.optionsLink = link;
    }

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-btn";
    favoriteButton.textContent = "❤️";

    buttons.append(cartButton, favoriteButton);
    info.append(title, rating, price, buttons);
    card.append(imageBox, info);

    return card;
}


function renderStoreProductCards() {

    document.querySelectorAll("[data-store-products]").forEach(function (container) {

        const limit = Number(container.dataset.limit) || Infinity;
        const detailsPath = container.dataset.detailsPath || "product-details.html";
        const imagesPath = container.dataset.imagesPath || "../images/";

        const products = getVisibleProducts().slice(0, limit);

        container.innerHTML = "";

        products.forEach(function (product) {
            container.appendChild(createProductCard(product, detailsPath, imagesPath));
        });

    });
}

// Run now, before main.js connects the cart and favorite buttons
renderStoreProductCards();
