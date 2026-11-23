
/* ==================================================
   FAYNEX - ADMIN CATEGORIES
   The store has fixed categories (FAYNEX_CATEGORIES
   in products.js). This page shows their numbers.
================================================== */


/* ==============================
   1. CATEGORIES ELEMENTS
============================== */

const categoriesSearch = document.getElementById("categories-search");
const categoriesBody = document.getElementById("categories-body");


/* ==============================
   2. CATEGORY DATA
============================== */

function getCategoriesData() {

    const products = getStoreProducts();
    const orders = getAllOrders();

    return FAYNEX_CATEGORIES.map(function (category) {

        const categoryProducts = products.filter(product => product.category === category.id);

        const inStock = categoryProducts.filter(product => Number(product.stock) > 0).length;

        // Units sold, to find the top category
        const productNames = categoryProducts.map(product => product.name);

        const sold = orders.reduce(function (sum, order) {
            if (getOrderStatus(order) === "Cancelled") {
                return sum;
            }

            return sum + (order.products || []).reduce(function (orderSum, item) {
                return productNames.includes(item.name)
                    ? orderSum + (Number(item.quantity) || 1)
                    : orderSum;
            }, 0);
        }, 0);

        return {
            ...category,
            productsCount: categoryProducts.length,
            inStock,
            sold
        };
    });
}


/* ==============================
   3. STATISTICS
============================== */

function renderCategoriesStats() {

    const categories = getCategoriesData();

    const totalProducts = categories.reduce((sum, category) => sum + category.productsCount, 0);

    // Top category = most units sold (or most products if nothing is sold yet)
    const topCategory = categories.slice().sort(function (a, b) {
        return (b.sold - a.sold) || (b.productsCount - a.productsCount);
    })[0];

    document.getElementById("total-categories").textContent = categories.length + " Categories";
    document.getElementById("total-category-products").textContent = totalProducts + " Products";
    document.getElementById("top-category").textContent = topCategory ? topCategory.name : "-";
}


/* ==============================
   4. CATEGORIES TABLE
============================== */

function renderCategoriesTable() {

    const searchValue = categoriesSearch.value.trim().toLowerCase();

    const categories = getCategoriesData().filter(function (category) {
        return category.name.toLowerCase().includes(searchValue);
    });

    if (categories.length === 0) {
        renderEmptyRow(categoriesBody, 6, "No categories found.");
        return;
    }

    categoriesBody.innerHTML = categories.map(function (category) {

        const hasProducts = category.productsCount > 0;

        return `
            <tr>
                <td>
                    <div class="category-icon">
                        <i class="fa-solid ${category.icon}"></i>
                    </div>
                </td>
                <td>${escapeAdminHTML(category.name)}</td>
                <td>
                    <span class="products-badge">
                        ${category.productsCount} ${category.productsCount === 1 ? "Product" : "Products"}
                    </span>
                </td>
                <td>
                    <span class="${hasProducts ? "active-status" : "out-stock"}">
                        ${hasProducts ? "Active" : "Empty"}
                    </span>
                </td>
                <td>${category.inStock}</td>
                <td class="actions">
                    <a class="view-btn" href="products.html?category=${encodeURIComponent(category.id)}"
                        aria-label="View ${escapeAdminHTML(category.name)} products">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                </td>
            </tr>
        `;

    }).join("");
}


/* ==============================
   5. INITIALIZE CATEGORIES PAGE
============================== */

categoriesSearch.addEventListener("input", renderCategoriesTable);

renderCategoriesStats();
renderCategoriesTable();
