
/* ==============================
   1. CONTACT ELEMENTS
============================== */

const contactForm = document.getElementById("contact-form");

const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const contactSubject = document.getElementById("contact-subject");
const contactMessage = document.getElementById("contact-message");


/* ==============================
   2. FILL LOGGED IN USER DATA
============================== */

document.addEventListener("DOMContentLoaded", function () {

    const user = getCurrentUser();

    if (!user || !contactForm) {
        return;
    }

    // Save the customer from typing their name and email again
    if (!contactName.value) {
        contactName.value = `${user.firstName} ${user.lastName}`;
    }

    if (!contactEmail.value) {
        contactEmail.value = user.email;
    }

});


/* ==============================
   3. HANDLE SEND MESSAGE
============================== */

if (contactForm) {

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();


        /* Validate Form */

        if (!contactForm.checkValidity()) {

            contactForm.reportValidity();

            return;

        }


        /* Get Form Values */

        const name = contactName.value.trim();
        const email = contactEmail.value.trim().toLowerCase();
        const subject = contactSubject.value.trim();
        const message = contactMessage.value.trim();


        /* Check Fields With Spaces Only */

        if (!name || !subject || !message) {

            showNotification(
                "Please fill in all fields.",
                "Missing Information",
                "error"
            );

            return;

        }


        /* Save Message (demo: saved in this browser only) */

        let messages = [];

        try {
            messages = JSON.parse(localStorage.getItem("faynexMessages") || "[]");
        } catch (error) {
            messages = [];
        }

        if (!Array.isArray(messages)) {
            messages = [];
        }

        messages.push({
            id: "MSG-" + Date.now(),
            name,
            email,
            subject,
            message,
            date: new Date().toISOString(),
            status: "New"
        });

        localStorage.setItem("faynexMessages", JSON.stringify(messages));


        /* Reset Form */

        contactSubject.value = "";
        contactMessage.value = "";

        // Keep name and email only for logged in users
        if (!getCurrentUser()) {
            contactName.value = "";
            contactEmail.value = "";
        }

        showNotification(
            "Thank you! We received your message and will reply soon.",
            "Message Sent"
        );

    });

}
