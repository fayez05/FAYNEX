
/* ==============================
   1. SHOP PRODUCT FILTERING
============================== */

function initializeProductFilters() {
    const searchInput = document.getElementById("product-search");
    const categoryFilter = document.getElementById("category-filter");
    const sortSelect = document.getElementById("sort-products");

    const productsContainer = document.querySelector(
        ".shop-products .products-container"
    );

    // Pagination elements
    const productsPerPageSelect = document.getElementById("products-per-page");
    const pageNumbersContainer = document.querySelector(".page-numbers");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");
    const productsCount = document.getElementById("products-count");

    // No products message elements
    const noProductsMessage = document.getElementById("no-products");
    const clearFiltersButton = document.getElementById("clear-filters");

    if (!searchInput || !categoryFilter || !sortSelect || !productsContainer) {
        return;
    }

    const productCards = Array.from(
        productsContainer.querySelectorAll(".product-card")
    );

    let currentPage = 1;

    let productsPerPage = productsPerPageSelect
        ? Number(productsPerPageSelect.value)
        : 8;

    // Keep the original product order
    productCards.forEach(function (card, index) {
        card.dataset.originalIndex = index;
    });

    // Read filters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get("category");
    const searchTerm = urlParams.get("search");

    // Wishlist mode: show only favorite products
    let favoritesOnly = urlParams.get("favorites") === "true";

    if (favoritesOnly) {
        showWishlistBanner();
    }

    // Select category from URL
    if (selectedCategory) {
        const categoryOption = Array.from(categoryFilter.options).find(
            option => option.value === selectedCategory
        );

        if (categoryOption) {
            categoryFilter.value = selectedCategory;
        }
    }

    // Fill search input from URL
    if (searchTerm) {
        searchInput.value = searchTerm;
    }

    // Scroll to the products count box
    function scrollToProductsCount() {
        if (productsCount) {
            productsCount.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    // Get matching and sorted products
    function getFilteredProducts() {
        const searchValue = searchInput.value.trim().toLowerCase();
        const categoryValue = categoryFilter.value;
        const sortValue = sortSelect.value;

        const filteredCards = productCards.filter(function (card) {
            const productName = card.querySelector("h3");

            if (!productName) {
                return false;
            }

            const name = productName.textContent.trim().toLowerCase();

            const matchesSearch = name.includes(searchValue);

            const matchesCategory =
                categoryValue === "all" ||
                card.dataset.category === categoryValue;

            const matchesFavorites =
                !favoritesOnly ||
                getFavorites().some(function (product) {
                    return product.name.toLowerCase() === name;
                });

            return matchesSearch && matchesCategory && matchesFavorites;
        });

        return filteredCards.sort(function (a, b) {
            const priceA = parseFloat(
                a.querySelector(".price").textContent.replace(/[^0-9.]/g, "")
            );

            const priceB = parseFloat(
                b.querySelector(".price").textContent.replace(/[^0-9.]/g, "")
            );

            if (sortValue === "price-low") {
                return priceA - priceB;
            }

            if (sortValue === "price-high") {
                return priceB - priceA;
            }

            if (sortValue === "newest") {
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            }

            if (sortValue === "rating") {
                return Number(b.dataset.rating) - Number(a.dataset.rating);
            }

            return (
                Number(a.dataset.originalIndex) -
                Number(b.dataset.originalIndex)
            );
        });
    }

    // Create pagination buttons
    function renderPagination(totalPages) {
        if (!pageNumbersContainer) {
            return;
        }

        pageNumbersContainer.innerHTML = "";

        for (let page = 1; page <= totalPages; page++) {
            const pageButton = document.createElement("a");

            pageButton.href = "#";
            pageButton.className = "page-number";
            pageButton.textContent = page;

            if (page === currentPage) {
                pageButton.classList.add("active");
                pageButton.setAttribute("aria-current", "page");
            }

            pageButton.addEventListener("click", function (event) {
                event.preventDefault();

                if (currentPage !== page) {
                    currentPage = page;
                    updateShop();
                    scrollToProductsCount();
                }
            });

            pageNumbersContainer.appendChild(pageButton);
        }

        // Previous button state
        if (prevButton) {
            prevButton.classList.toggle("disabled", currentPage === 1);

            prevButton.setAttribute(
                "aria-disabled",
                String(currentPage === 1)
            );
        }

        // Next button state
        if (nextButton) {
            nextButton.classList.toggle(
                "disabled",
                currentPage === totalPages
            );

            nextButton.setAttribute(
                "aria-disabled",
                String(currentPage === totalPages)
            );
        }
    }

    // Display products for the current page
    function updateShop() {
        const filteredProducts = getFilteredProducts();

        // Show or hide the no-products message
        if (noProductsMessage) {
            noProductsMessage.style.display =
                filteredProducts.length === 0 ? "block" : "none";
        }

        // Calculate pagination
        const totalPages = Math.max(
            1,
            Math.ceil(filteredProducts.length / productsPerPage)
        );

        // Keep current page within the valid range
        currentPage = Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;

        // Update products count
        if (productsCount) {
            if (filteredProducts.length === 0) {
                productsCount.innerHTML = "No products found";
            } else if (filteredProducts.length <= productsPerPage) {
                const productWord =
                    filteredProducts.length === 1 ? "product" : "products";

                productsCount.innerHTML = `
                    <span>Showing</span>
                    <strong>${filteredProducts.length}</strong>
                    <span>${productWord}</span>
                `;
            } else {
                const firstProduct = startIndex + 1;

                const lastProduct = Math.min(
                    endIndex,
                    filteredProducts.length
                );

                productsCount.innerHTML = `
                    <span>Showing</span>
                    <strong>${firstProduct}–${lastProduct}</strong>
                    <span>of</span>
                    <strong>${filteredProducts.length}</strong>
                    <span>products</span>
                `;
            }
        }

        // Hide all products first
        productCards.forEach(function (card) {
            card.style.display = "none";
        });

        // Display only products belonging to the current page
        filteredProducts.forEach(function (card, index) {
            productsContainer.appendChild(card);

            if (index >= startIndex && index < endIndex) {
                card.style.display = "";
            }
        });

        // Hide pagination when there are no matching products
        const paginationDisplay =
            filteredProducts.length === 0 ? "none" : "";

        if (pageNumbersContainer) {
            pageNumbersContainer.style.display = paginationDisplay;
        }

        if (prevButton) {
            prevButton.style.display = paginationDisplay;
        }

        if (nextButton) {
            nextButton.style.display = paginationDisplay;
        }

        // Update pagination buttons
        renderPagination(totalPages);
    }

    // Search products
    searchInput.addEventListener("input", function () {
        currentPage = 1;
        updateShop();
    });

    // Filter by category
    categoryFilter.addEventListener("change", function () {
        currentPage = 1;
        updateShop();
    });

    // Sort products
    sortSelect.addEventListener("change", function () {
        currentPage = 1;
        updateShop();
    });

    // Change products per page
    if (productsPerPageSelect) {
        productsPerPageSelect.addEventListener("change", function () {
            productsPerPage = Number(productsPerPageSelect.value);
            currentPage = 1;

            updateShop();
            scrollToProductsCount();
        });
    }

    // Previous page
    if (prevButton) {
        prevButton.addEventListener("click", function (event) {
            event.preventDefault();

            if (currentPage > 1) {
                currentPage--;
                updateShop();
                scrollToProductsCount();
            }
        });
    }

    // Next page
    if (nextButton) {
        nextButton.addEventListener("click", function (event) {
            event.preventDefault();

            const totalPages = Math.max(
                1,
                Math.ceil(getFilteredProducts().length / productsPerPage)
            );

            if (currentPage < totalPages) {
                currentPage++;
                updateShop();
                scrollToProductsCount();
            }
        });
    }

    // Clear search, filters, and sorting
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", function () {
            searchInput.value = "";
            categoryFilter.value = "all";
            sortSelect.value = "default";

            // Leave wishlist mode and show all products
            if (favoritesOnly) {
                window.location.href = "shop.html";
                return;
            }

            currentPage = 1;
            updateShop();
        });
    }

    // In wishlist mode, hide a product right after it is removed from favorites
    if (favoritesOnly) {
        productsContainer.addEventListener("click", function (event) {
            if (event.target.closest(".favorite-btn")) {
                updateShop();
            }
        });
    }

    // Initial display
    updateShop();
}

/* ==============================
   2. WISHLIST BANNER
============================== */

function showWishlistBanner() {
    const bannerTitle = document.querySelector(".shop-banner-content h1");
    const bannerText = document.querySelector(".shop-banner-content p");

    document.title = "FAYNEX | My Wishlist";

    if (bannerTitle) {
        bannerTitle.textContent = "My Wishlist";
    }

    if (bannerText) {
        bannerText.textContent = "Products you saved to your favorites.";
    }

    // Change the empty message for the wishlist
    const noProductsTitle = document.querySelector("#no-products h3");
    const noProductsText = document.querySelector("#no-products p");
    const clearFiltersButton = document.getElementById("clear-filters");

    if (noProductsTitle) {
        noProductsTitle.textContent = "Your Wishlist Is Empty";
    }

    if (noProductsText) {
        noProductsText.textContent =
            "Tap the heart on any product to save it here.";
    }

    if (clearFiltersButton) {
        clearFiltersButton.textContent = "Browse All Products";
    }
}


/* ==============================
   3. INITIALIZE SHOP
============================== */

document.addEventListener("DOMContentLoaded", function () {
    initializeProductFilters();
});
