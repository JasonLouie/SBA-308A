/**
 * Reveals the description
 * @param {MouseEvent} e
 */
export function showDescription(e) {
    if (e.target === e.currentTarget) {
        e.target.children[0].classList.remove("hidden");
    }
}

/**
 * Hides the description
 * @param {MouseEvent} e
 */
export function hideDescription(e) {
    if (e.target === e.currentTarget) {
        e.target.children[0].classList.add("hidden");
    }
}

/**
 * @typedef {Object} UserObject
 * @property {string} username - The username of a user
 * @property {string} email - The email address of a user
 * @property {string} password - The password of a user
 * @property {{"dark-mode": boolean, hints: boolean, blur: boolean, colors: boolean}} settings - The settings of a user
 * @property {} - The anime character guesses of a user
 */

/**
 * Retrieves the users stored in localStorage
 * @returns {[UserObject]} - User data stored in localStorage
 */
export function getUsers() {
    // Initialize the local storage for users.
    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([]));
    }
    const userData = JSON.parse(localStorage.getItem("users"));
    return userData;
}

/**
     * Returns the user object that matches the username and password in localStorage
     * @param {string} username - The username being checked
     * @param {string} password - The password being checked
     */
export function getUser(username, password) {
    const userData = getUsers();
    for (const user of userData) {
        if (user.username === username && user.password === password) {
            return user;
        }
    }
}

/**
 * Adds the user object to the array in localStorage
 * @param {UserObject} userObject - The user object being added to localStorage
 */
export function addUser(userObject) {
    const userData = getUsers();
    userData.push(userObject);
    localStorage.setItem("users", JSON.stringify(userData));
}

/**
 * Checks if the property's value is already being used by another user
 * @param {string} property - The property being checked
 * @param {string} value - Value being checked
 */
export function propertyExists(property, value) {
    const userData = getUsers();
    for (const user of userData) {
        if (user[property] === value) {
            return true;
        }
    }
    return false;
}

/**
 * Clears all users from localStorage
 */
export function clearUsers() {
    localStorage.setItem("users", JSON.stringify([]));
}