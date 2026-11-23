
/* ==================================================
   FAYNEX - ADMIN ADD / EDIT PRODUCT
================================================== */


/* ==============================
   1. FORM ELEMENTS
============================== */

const productForm = document.getElementById("product-form");

const productNameInput = document.getElementById("product-name");
const productCategoryInput = document.getElementById("product-category");
const productBrandInput = document.getElementById("product-brand");
const productPriceInput = document.getElementById("product-price");
const productDiscountInput = document.getElementById("product-discount");
const productStockInput = document.getElementById("product-stock");
const productSkuInput = document.getElementById("product-sku");
const productStatusInput = document.getElementById("product-status");
const productDescriptionInput = document.getElementById("product-description");
const productImageInput = document.getElementById("product-image");
const productImagePreview = document.getElementById("product-image-preview");
const productCancelButton = document.getElementById("product-cancel-btn");

const PRODUCT_IMAGES_PATH = "../images/";


/* ==============================
   2. EDIT MODE
   add-product.html?id=... edits a product
============================== */

const editProductId = new URLSearchParams(window.location.search).get("id");

const editingProduct = editProductId
    ? getStoreProducts().find(product => product.id === editProductId)
    : null;

// New image chosen by the admin (saved as data)
let selectedImageData = null;


function fillProductForm(product) {

    document.getElementById("product-form-title").textContent = "Edit Product";
    document.getElementById("product-form-subtitle").textContent = "Update " + product.name;
    document.title = "FAYNEX | Edit Product";

    productNameInput.value = product.name;
    productCategoryInput.value = product.category;
    productBrandInput.value = product.brand || "";
    productPriceInput.value = product.originalPrice || product.price;
    productDiscountInput.value = product.discount || "";
    productStockInput.value = product.stock ?? 0;
    productSkuInput.value = product.sku || "";
    productStatusInput.value = product.status === "Hidden" ? "Hidden" : "Active";
    productDescriptionInput.value = product.description || "";

    // Tick the saved colors
    const colorNames = (product.colors || []).map(color => color.name);

    productForm.querySelectorAll('input[name="colors"]').forEach(function (checkbox) {
        checkbox.checked = colorNames.includes(checkbox.value);
    });

    // Show the current image
    productImagePreview.src = getProductImageSrc(product, PRODUCT_IMAGES_PATH);
    productImagePreview.hidden = false;

    // Editing does not require a new image
    productImageInput.required = false;
}


/* ==============================
   3. IMAGE UPLOAD
   The image is made smaller, then saved as text (data URL),
   because the store has no server to upload files to.
============================== */

function resizeImage(file, maxSize = 600) {

    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function () {

            const image = new Image();

            image.onload = function () {

                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));

                const canvas = document.createElement("canvas");
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                const context = canvas.getContext("2d");

                // White background for transparent images
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


productImageInput.addEventListener("change", async function () {

    const file = productImageInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        showNotification("Please choose an image file.", "Invalid Image", "error");
        productImageInput.value = "";
        return;
    }

    try {

        selectedImageData = await resizeImage(file);

        productImagePreview.src = selectedImageData;
        productImagePreview.hidden = false;

    } catch (error) {

        showNotification("This image could not be read. Try another one.", "Invalid Image", "error");
        productImageInput.value = "";
    }
});


/* ==============================
   4. SAVE PRODUCT
============================== */

// "Galaxy S26 Ultra" -> "galaxy-s26-ultra"
function createProductId(name, products) {

    const baseId = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product";

    let productId = baseId;
    let number = 2;

    while (products.some(product => product.id === productId)) {
        productId = baseId + "-" + number;
        number++;
    }

    return productId;
}


productForm.addEventListener("submit", function (event) {

    event.preventDefault();


    /* Validate Form */

    if (!editingProduct && !selectedImageData) {
        productImageInput.required = true;
    }

    if (!productForm.checkValidity()) {
        productForm.reportValidity();
        return;
    }

    const name = productNameInput.value.trim();
    const description = productDescriptionInput.value.trim();

    if (!name || !description) {
        showNotification("Please enter the product name and description.", "Missing Information", "error");
        return;
    }


    /* Prices */

    const originalPrice = Math.round(Number(productPriceInput.value) * 100) / 100;
    const discount = Math.min(90, Math.max(0, Math.round(Number(productDiscountInput.value) || 0)));
    const finalPrice = Math.round(originalPrice * (1 - discount / 100) * 100) / 100;


    /* Image (new image, or keep the old one) */

    const image = selectedImageData || editingProduct?.image;


    /* Colors (all colors use the main image) */

    const colorCheckboxes = Array.from(productForm.querySelectorAll('input[name="colors"]'));
    const formColorNames = colorCheckboxes.map(checkbox => checkbox.value);

    // Keep old colors that have no checkbox in the form (e.g. Gold)
    const extraColors = (editingProduct?.colors || []).filter(function (color) {
        return !formColorNames.includes(color.name);
    });

    const checkedColors = colorCheckboxes
        .filter(checkbox => checkbox.checked)
        .map(function (checkbox) {
            const oldColor = (editingProduct?.colors || []).find(color => color.name === checkbox.value);
            return { name: checkbox.value, image: oldColor?.image || image };
        });

    // Keep the original order of the old colors
    const colors = (editingProduct?.colors || [])
        .filter(color => extraColors.includes(color) || checkedColors.some(item => item.name === color.name))
        .map(color => checkedColors.find(item => item.name === color.name) || color)
        .concat(checkedColors.filter(item => !(editingProduct?.colors || []).some(color => color.name === item.name)));


    /* Build Product */

    const products = getStoreProducts();

    const productData = {
        ...(editingProduct || {}),
        id: editingProduct ? editingProduct.id : createProductId(name, products),
        name,
        category: productCategoryInput.value,
        categoryName: getCategoryName(productCategoryInput.value),
        brand: productBrandInput.value.trim(),
        price: finalPrice,
        originalPrice,
        discount,
        stock: Math.max(0, Math.floor(Number(productStockInput.value) || 0)),
        sku: productSkuInput.value.trim() || "SKU-" + Date.now().toString().slice(-6),
        status: productStatusInput.value,
        description,
        image,
        colors,
        storage: editingProduct?.storage || [],
        features: editingProduct?.features || [],
        rating: editingProduct?.rating || 0,
        reviews: editingProduct?.reviews || 0,
        createdAt: editingProduct?.createdAt || new Date().toISOString().slice(0, 10)
    };


    /* Save */

    if (editingProduct) {
        const index = products.findIndex(product => product.id === editingProduct.id);
        products[index] = productData;
    } else {
        products.push(productData);
    }

    try {
        saveStoreProducts(products);
    } catch (error) {
        // Browser storage is full (usually because of large images)
        showNotification(
            "The browser storage is full. Try a smaller image.",
            "Could Not Save",
            "error"
        );
        return;
    }

    sessionStorage.setItem("faynexSavedProduct", name);

    window.location.href = "products.html";
});


/* ==============================
   5. CANCEL
============================== */

productCancelButton.addEventListener("click", function () {
    window.location.href = "products.html";
});


/* ==============================
   6. INITIALIZE FORM
============================== */

if (editProductId && !editingProduct) {

    showNotification("This product was not found.", "Product Not Found", "error");

} else if (editingProduct) {

    fillProductForm(editingProduct);

}
