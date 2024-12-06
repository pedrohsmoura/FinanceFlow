document.addEventListener("DOMContentLoaded", function() {
    const form = {
        email: () => document.getElementById("email"),
        password: () => document.getElementById("password"),
        confirmPassword: () => document.getElementById("confirmPassword"),
        registerButton: () => document.getElementById("register-button"),
        loginButton: () => document.getElementById("login-button"),
        emailRequiredError: () => document.getElementById("email-required-error"),
        emailInvalidError: () => document.getElementById("email-invalid-error"),
        passwordRequiredError: () => document.getElementById("password-required-error"),
        passwordMinLengthError: () => document.getElementById("password-min-length-error"),
        passwordDoesntMatchError: () => document.getElementById("password-doesnt-match-error")
    };

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            window.location.href = "../home/home.html";
        }
    });

    function onChangeEmail() {
        toggleEmailErrors();
        toggleRegisterButtonDisable();
    }

    function onChangePassword() {
        togglePasswordErrors();
        toggleRegisterButtonDisable();
    }

    function onChangeConfirmPassword() {
        validatePasswordsMatch();
        toggleRegisterButtonDisable();
    }

    function register() {
        const email = form.email().value;
        const password = form.password().value;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                hideLoading();
                window.location.href = "../home/home.html";
            })
            .catch((error) => {
                debugger;
                hideLoading();
                alert(getErrorMessage(error));
            });
    }

    function getErrorMessage(error) {
        if (error.code == "auth/email-already-in-use") {
            return "Email já está em uso";
        }
        if (error.code == "auth/invalid-email") {
            return "Email inválido";
        }
        if (error.code == "auth/weak-password") {
            return "Senha fraca";
        }
        return error.message;
    }

    function toggleEmailErrors() {
        const email = form.email().value;
        form.emailRequiredError().style.display = email ? "none" : "block";
        form.emailInvalidError().style.display = validateEmail(email) ? "none" : "block";
    }

    function togglePasswordErrors() {
        const password = form.password().value;
        form.passwordRequiredError().style.display = password ? "none" : "block";
        form.passwordMinLengthError().style.display = password.length >= 6 ? "none" : "block";
    }

    function validatePasswordsMatch() {
        const password = form.password().value;
        const confirmPassword = form.confirmPassword().value;
        form.passwordDoesntMatchError().style.display = password === confirmPassword ? "none" : "block";
    }

    function toggleRegisterButtonDisable() {
        form.registerButton().disabled = !isFormValid();
    }

    function isFormValid() {
        const email = form.email().value;
        if (!email || !validateEmail(email)) {
            return false;
        }

        const password = form.password().value;
        if (!password || password.length < 6) {
            return false;
        }

        const confirmPassword = form.confirmPassword().value;
        if (password !== confirmPassword) {
            return false;
        }

        return true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function goToLogin() {
        window.location.href = "../../index.html";
    }
    
    // Adiciona os event listeners
    form.email().addEventListener("change", onChangeEmail);
    form.password().addEventListener("change", onChangePassword);
    form.confirmPassword().addEventListener("change", onChangeConfirmPassword);
    form.registerButton().addEventListener("click", register);
    form.loginButton().addEventListener("click", goToLogin);
});