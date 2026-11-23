
/* ==================================================
   FAYNEX - ADMIN SETTINGS
   Saved in localStorage ("faynexSettings").
   main.js shows the email, phone and address
   in the footer of the store pages.
================================================== */


/* ==============================
   1. SETTINGS ELEMENTS
============================== */

const settingsForm = document.getElementById("settings-form");

const SETTINGS_FIELDS = {
    storeName: document.getElementById("settings-name"),
    storeEmail: document.getElementById("settings-email"),
    storePhone: document.getElementById("settings-phone"),
    storeAddress: document.getElementById("settings-address"),
    storeWebsite: document.getElementById("settings-website")
};


/* ==============================
   2. LOAD SETTINGS
============================== */

function fillSettingsForm() {

    const settings = getStoreSettings();

    Object.entries(SETTINGS_FIELDS).forEach(function ([key, input]) {
        input.value = settings[key] || "";
    });
}


/* ==============================
   3. SAVE SETTINGS
============================== */

settingsForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (!settingsForm.checkValidity()) {
        settingsForm.reportValidity();
        return;
    }

    const settings = {};

    Object.entries(SETTINGS_FIELDS).forEach(function ([key, input]) {
        settings[key] = input.value.trim();
    });

    if (!settings.storeName || !settings.storePhone || !settings.storeAddress) {
        showNotification("Please fill in all required fields.", "Missing Information", "error");
        return;
    }

    localStorage.setItem("faynexSettings", JSON.stringify(settings));

    showNotification("Your store settings have been saved.", "Settings Saved");
});


/* ==============================
   4. INITIALIZE SETTINGS PAGE
============================== */

fillSettingsForm();
