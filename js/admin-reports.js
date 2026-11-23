
/* ==================================================
   FAYNEX - ADMIN REPORTS
================================================== */


/* ==============================
   1. REPORTS ELEMENTS
============================== */

const reportsSearch = document.getElementById("reports-search");
const reportTopProducts = document.getElementById("report-top-products");

const RANK_ICONS = ["🥇", "🥈", "🥉"];
const RANK_CLASSES = ["gold", "silver", "bronze"];


/* ==============================
   2. STATISTICS
============================== */

function renderReportsStats() {

    const orders = getAdminOrders();
    const customers = getAdminCustomers();

    document.getElementById("report-revenue").textContent = formatAdminPrice(getOrdersRevenue(orders));

    document.getElementById("report-orders").textContent =
        orders.length + (orders.length === 1 ? " Order" : " Orders");

    document.getElementById("report-customers").textContent =
        customers.length + (customers.length === 1 ? " Customer" : " Customers");
}


/* ==============================
   3. SALES CHART
============================== */

function renderReportsChart() {
    renderBarChart(
        document.getElementById("report-sales-chart"),
        getMonthlySales(getAdminOrders(), 6)
    );
}


/* ==============================
   4. TOP SELLING PRODUCTS
============================== */

function renderReportTopProducts() {

    const searchValue = reportsSearch.value.trim().toLowerCase();

    // Rank is decided before searching, so it stays the same
    const products = getTopProducts(getAllOrders(), 10)
        .map((product, index) => ({ ...product, rank: index }))
        .filter(product => product.name.toLowerCase().includes(searchValue))
        .slice(0, 5);

    if (products.length === 0) {
        reportTopProducts.innerHTML = '<p class="empty-row">No sales found.</p>';
        return;
    }

    reportTopProducts.innerHTML = products.map(function (product) {

        const rankIcon = RANK_ICONS[product.rank] || "#" + (product.rank + 1);
        const rankClass = RANK_CLASSES[product.rank] || "";

        return `
            <div class="report-product-card">
                <span class="rank ${rankClass}">${rankIcon}</span>
                <div>
                    <h4>${escapeAdminHTML(product.name)}</h4>
                    <p>${product.quantity} ${product.quantity === 1 ? "Sale" : "Sales"} · ${formatAdminPrice(product.revenue)}</p>
                </div>
            </div>
        `;

    }).join("");
}


/* ==============================
   5. INITIALIZE REPORTS PAGE
============================== */

reportsSearch.addEventListener("input", renderReportTopProducts);

renderReportsStats();
renderReportsChart();
renderReportTopProducts();
