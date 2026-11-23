
/* ==============================
   1. REGISTER ELEMENTS
============================== */

const registerForm = document.getElementById("register-form");

const registerFirstName = document.getElementById("register-first-name");
const registerLastName = document.getElementById("register-last-name");
const registerEmail = document.getElementById("register-email");
const registerPhone = document.getElementById("register-phone");
const registerPassword = document.getElementById("register-password");
const registerConfirmPassword = document.getElementById("register-confirm-password");


/* ==============================
   2. PASSWORD MATCH CHECK
============================== */

function checkPasswordsMatch() {

    if (registerConfirmPassword.value && registerConfirmPassword.value !== registerPassword.value) {

        registerConfirmPassword.setCustomValidity("Passwords do not match.");

    } else {

        registerConfirmPassword.setCustomValidity("");

    }
}


if (registerPassword && registerConfirmPassword) {

    registerPassword.addEventListener("input", checkPasswordsMatch);
    registerConfirmPassword.addEventListener("input", checkPasswordsMatch);

}


/* ==============================
   3. HANDLE REGISTER
============================== */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* Validate Form */

        checkPasswordsMatch();

        if (!registerForm.checkValidity()) {

            registerForm.reportValidity();

            return;

        }


        /* Get Form Values */

        const firstName = registerFirstName.value.trim();
        const lastName = registerLastName.value.trim();
        const email = registerEmail.value.trim().toLowerCase();
        const phone = registerPhone.value.trim();
        const password = registerPassword.value;


        /* Check Empty Names (spaces only) */

        if (!firstName || !lastName) {

            showNotification(
                "Please enter your first and last name.",
                "Name Required",
                "error"
            );

            return;

        }


        /* Check Email Is Not Used */

        if (findUserByEmail(email)) {

            showNotification(
                "An account with this email already exists. Please log in.",
                "Email Already Registered",
                "error"
            );

            registerEmail.focus();

            return;

        }


        /* Create User */

        const newUser = {
            id: "USR-" + Date.now(),
            firstName,
            lastName,
            email,
            phone,
            passwordHash: await hashPassword(password),
            createdAt: new Date().toISOString()
        };


        /* Save User */

        const users = getUsers();

        users.push(newUser);

        saveUsers(users);


        /* Go to Login Page */

        sessionStorage.setItem("faynexRegisteredEmail", email);

        window.location.href = "login.html?registered=true";

    });

}
