// Handle user login
import { game } from "./index.js";
import { overlayDiv } from "../constants/selectors.js";
import { getUsers, propertyExists, getUser } from "./functions.js";
import User from "../classes/User.js";

/**
 * Handles form validation for user login
 */
export function handleLogin(e) {
    e.preventDefault(); // Prevent page from refreshing
    const form = document.getElementById("login-form");
    const username = form.elements["username"];
    const password = form.elements["password"];

    const usernameValid = username.checkValidity();
    const passwordValid = password.checkValidity();

    if (usernameValid && passwordValid) { // No errors, initiate login
        const userObj = getUser(username.value, password.value);
        const user = new User(username.value, userObj.email, userObj.settings, userObj.guesses);
        form.reset();
        game.user = user;
    }

    username.reportValidity();
    password.reportValidity();
}

/**
 * Checks if the username and password pair exist in localStorage
 * @param {string} username - The username being checked
 * @param {string} password - The password being checked
 */
function validateCredentials(username, password) {
    const userData = getUsers();
    for (const user of userData) {
        if (user.username === username && user.password === password) {
            return true;
        }
    }
    return false;
}

/**
* Validates the username entered
* @param {Event} e - Event from interacting with input
*/
export function validateLogin(e) {
    const form = overlayDiv.querySelector("form");
    if (e.target.name === "username"){
        const username = e.target;
        if (!propertyExists(e.target.name, username.value)) {
            username.setCustomValidity("That username does not exist.");
        } else {
            username.setCustomValidity("");
        }
    } else if (e.target.name === "password") {
        const username = form.elements["username"];
        const password = e.target;
        if (!propertyExists(e.target.name, username.value)) {
            username.setCustomValidity("That username does not exist.");
            username.reportValidity();
            return;
        } else if (!validateCredentials(username.value, password.value)) {
            password.setCustomValidity("Incorrect password.");
        } else {
            password.setCustomValidity("");
        }
    }
    e.target.reportValidity();
}