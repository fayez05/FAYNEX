
/* ==================================================
   FAYNEX - ADMIN PRODUCTS
================================================== */


/* ==============================
   1. PRODUCTS ELEMENTS & STATE
============================== */

const productsSearch = document.getElementById("products-search");
const productsBody = document.getElementById("products-body");
const productsPagination = document.getElementById("products-pagination");
const productFilterCards = document.querySelectorAll("[data-filter]");

const PRODUCTS_PER_PAGE = 8;
const ADMIN_IMAGES_PATH = "../images/";

let productsPage = 1;

// Category from the link (categories.html?category=...) or "all"
let productsCategory = new URLSearchParams(window.location.search).get("category") || "all";


/* ==============================
   2. CATEGORY COUNTS
============================== */

function renderProductCounts() {

    const products = getStoreProducts();

    productFilterCards.forEach(function (card) {

        const category = card.dataset.filter;

        const count = category === "all"
            ? products.length
            : products.filter(product => product.category === category).length;

        document.getElementById("count-" + category).textContent =
            count + (count === 1 ? " Product" : " Products");

        card.classList.toggle("active", productsCategory === category);
    });
}


/* ==============================
   3. PRODUCTS TABLE
============================== */

// Active / Hidden / Out of Stock
function getProductStatus(product) {

    if (product.status === "Hidden") {
        return { text: "Hidden", className: "status pending-status" };
    }

    if (Number(product.stock) <= 0) {
        return { text: "Out of Stock", className: "status out-stock" };
    }

    return { text: "Active", className: "status active-status" };
}


function getFilteredProducts() {

    const searchValue = productsSearch.value.trim().toLowerCase();

    return getStoreProducts().filter(function (product) {

        const matchesCategory = productsCategory === "all" || product.category === productsCategory;

        const searchText = [product.name, product.brand, product.sku].join(" ").toLowerCase();

        return matchesCategory && searchText.includes(searchValue);
    });
}


function renderProductsTable() {

    const products = getFilteredProducts();

    const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
    productsPage = Math.min(productsPage, totalPages);

    if (products.length === 0) {
        renderEmptyRow(productsBody, 7, "No products found.");
        renderAdminPagination(productsPagination, 0, PRODUCTS_PER_PAGE, 1, function () {});
        return;
    }

    const pageProducts = products.slice(
        (productsPage - 1) * PRODUCTS_PER_PAGE,
        productsPage * PRODUCTS_PER_PAGE
    );

    productsBody.innerHTML = pageProducts.map(function (product) {

        const status = getProductStatus(product);
        const id = escapeAdminHTML(product.id);
        const name = escapeAdminHTML(product.name);

        return `
            <tr>
                <td><img src="${escapeAdminHTML(getProductImageSrc(product, ADMIN_IMAGES_PATH))}" alt="${name}"></td>
                <td>${name}</td>
                <td>${escapeAdminHTML(getCategoryName(product.category))}</td>
                <td>${formatAdminPrice(product.price)}</td>
                <td>${Number(product.stock) || 0}</td>
                <td><span class="${status.className}">${status.text}</span></td>
                <td class="actions">
                    <button class="view-btn" type="button" data-id="${id}" aria-label="View ${name} in the store">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="edit-btn" type="button" data-id="${id}" aria-label="Edit ${name}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-btn" type="button" data-id="${id}" aria-label="Delete ${name}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

    }).join("");

    renderAdminPagination(productsPagination, products.length, PRODUCTS_PER_PAGE, productsPage, function (page) {
        productsPage = page;
        renderProductsTable();
    });
}


/* ==============================
   4. DELETE PRODUCT
============================== */

function confirmDeleteProduct(productId) {

    const product = getStoreProducts().find(item => item.id === productId);

    if (!product) {
        return;
    }

    openAdminModal(
        "Delete Product",
        `<p>Are you sure you want to delete <strong>${escapeAdminHTML(product.name)}</strong>?
         It will be removed from the store. This cannot be undone.</p>`,
        [
            { text: "Cancel", onClick: closeAdminModal },
            {
                text: "Delete",
                className: "modal-delete-btn",
                onClick: function () {

                    const products = getStoreProducts().filter(item => item.id !== productId);

                    saveStoreProducts(products);
                    closeAdminModal();
                    renderProductCounts();
                    renderProductsTable();

                    showNotification(product.name + " was deleted.", "Product Deleted");
                }
            }
        ]
    );
}


/* ==============================
   5. EVENTS
============================== */

productsSearch.addEventListener("input", function () {
    productsPage = 1;
    renderProductsTable();
});

productFilterCards.forEach(function (card) {
    card.addEventListener("click", function () {
        productsCategory = card.dataset.filter;
        productsPage = 1;
        renderProductCounts();
        renderProductsTable();
    });
});

productsBody.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-id]");

    if (!button) {
        return;
    }

    const productId = button.dataset.id;

    if (button.classList.contains("view-btn")) {
        // Open the customer product page in a new tab
        window.open("../pages/product-details.html?id=" + encodeURIComponent(productId), "_blank");
    }

    if (button.classList.contains("edit-btn")) {
        window.location.href = "add-product.html?id=" + encodeURIComponent(productId);
    }

    if (button.classList.contains("delete-btn")) {
        confirmDeleteProduct(productId);
    }
});


/* ==============================
   6. INITIALIZE PRODUCTS PAGE
============================== */

renderProductCounts();
renderProductsTable();

// Message after saving on the Add Product page
const savedProductName = sessionStorage.getItem("faynexSavedProduct");

if (savedProductName) {
    sessionStorage.removeItem("faynexSavedProduct");
    showNotification(savedProductName + " was saved.", "Product Saved");
}
