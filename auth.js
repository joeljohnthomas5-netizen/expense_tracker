const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Check whether email already exists

        const existingUser = users.find(function (user) {
            return user.email === email;
        });

        if (existingUser) {

            document.getElementById("registerMessage").textContent =
                "Email already registered.";

            return;
        }


        // Create new user

        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password
        };


        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));


        document.getElementById("registerMessage").textContent =
            "Registration successful!";


        registerForm.reset();


        setTimeout(function () {
            window.location.href = "login.html";
        }, 1000);

    });

}

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("loginPassword")
            .value;


        const users =
            JSON.parse(localStorage.getItem("users")) || [];


        const user = users.find(function (user) {

            return (
                user.email === email &&
                user.password === password
            );

        });


        if (!user) {

            document.getElementById("loginMessage").textContent =
                "Invalid email or password.";

            return;
        }


        // Create session

        sessionStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );


        // Go to dashboard

        window.location.href = "index.html";

    });

}