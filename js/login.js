
/* ==============================
   1. LOGIN ELEMENTS
============================== */

const loginForm = document.getElementById("login-form");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");


/* ==============================
   2. AFTER REGISTER MESSAGE
============================== */

document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(window.location.search);

    // Message after logout
    if (urlParams.get("loggedout") === "true") {

        showNotification(
            "You have been logged out.",
            "Logged Out"
        );

        return;

    }

    if (urlParams.get("registered") !== "true") {
        return;
    }

    // Fill the email that was just registered
    const registeredEmail = sessionStorage.getItem("faynexRegisteredEmail");

    if (registeredEmail && loginEmail) {

        loginEmail.value = registeredEmail;

        sessionStorage.removeItem("faynexRegisteredEmail");

        loginPassword.focus();

    }

    showNotification(
        "Your account has been created. Please log in.",
        "Account Created"
    );

});


/* ==============================
   3. HANDLE LOGIN
============================== */

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* Validate Form */

        if (!loginForm.checkValidity()) {

            loginForm.reportValidity();

            return;

        }


        /* Find User */

        const user = findUserByEmail(loginEmail.value);

        const passwordHash = await hashPassword(loginPassword.value);


        /* Check Email and Password */

        if (!user || user.passwordHash !== passwordHash) {

            showNotification(
                "The email or password is incorrect.",
                "Login Failed",
                "error"
            );

            loginPassword.value = "";

            loginPassword.focus();

            return;

        }


        /* Save Logged In User */

        setCurrentUser(user);


        /* Go to Profile Page */

        window.location.href = "profile.html";

    });

}
