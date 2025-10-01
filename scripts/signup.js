// Handle user signing up and creation of new account
import { game } from "./index.js";
import User from "../classes/User.js";
import { addUser, propertyExists } from "./functions.js";
import { overlayDiv } from "../constants/selectors.js";

/**
 * Handles form validation for user login
*/
export function handleSignUp(e) {
    e.preventDefault(); // Prevent page from refreshing
    const form = document.getElementById("signup-form");
    const username = form.elements["username"];
    const email = form.elements["email"];
    const password = form.elements["password"];
    
    const usernameValid = username.checkValidity()
    const emailValid = email.checkValidity();
    const passwordValid = password.checkValidity();

    if (usernameValid && emailValid && passwordValid) { // No errors, initiate signup
        addUser({username: username.value, email: email.value, password: password.value, settings: game.user.settings, guesses: game.user.guesses});
        const user = new User(username.value, email.value, game.user.settings, game.user.guesses);
        form.reset();
        game.user = user;
    }
    
    password.reportValidity();
    email.reportValidity();
    username.reportValidity();
}

/**
 * Validates the username when signing up
 * @param {Event} e - Event from interacting with input
*/
export function validateSignUpUsername(e) {
    const username = e.target;
    if (!username.value.match(/^[A-Za-z0-9]+$/)) {
        username.value.setCustomValidity("Username cannot contain special characters or whitespace.");
    } else if (propertyExists("username", username.value)) {
        username.setCustomValidity("That username is already taken.");
    } else {
        username.setCustomValidity("")
    }
    username.reportValidity();
}

/**
 * Validates the password entered
 * @param {Event} e - Event from interacting with input
 */
export function validateSignUpPassword(e) {
    const form = overlayDiv.querySelector("form");
    const password = e.target;
    const confirmPassword = form.elements["confirmPassword"];
    if (!password.value.match(/\W/)) {
        password.setCustomValidity("Password must contain at least one special character.");
    } else if (password.value.toLowerCase().match(/password/)) {
        password.setCustomValidity('Password cannot contain the word "password".');
    } else if (password.value != confirmPassword.value) {
        console.log(password.value, confirmPassword.value);
        password.setCustomValidity("Both passwords must match.");
    } else {
        password.setCustomValidity("");
    }
    password.reportValidity();
}

/**
 * Validates the confirmed password entered
 * @param {Event} e - Event from interacting with input
 */
export function validateBothPasswords(e) {
    const form = overlayDiv.querySelector("form");
    const password = form.elements["password"];
    const confirmPassword = e.target;
    if (password.value != confirmPassword.value) {
        password.setCustomValidity("Both passwords must match.");
    } else {
        password.setCustomValidity("");
    }
    password.reportValidity();
}

/**
 * Validates the email entered
 * @param {Event} e - Event from interacting with input
 */
export function validateEmail(e) {
    const email = e.target;
    if (propertyExists("email", email.value)) {
        email.setCustomValidity("Email is already taken.");
    } else {
        email.setCustomValidity("");
    }
    email.reportValidity();
}