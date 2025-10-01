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
 * Represents the object containing the user's settings
 * @typedef {{"dark-mode": boolean, hints: boolean, blur: boolean, colors: boolean}} UserSettings - The settings of a user
 */

/**
 * Represents the object containing a guess for a particular anime main character
 * @typedef {Object} UserGuess - Used in User.js
 * @property {null | string} userAnswer - The valid guess provided by the user
 * @property {number} guessesTook - The number of guesses the user used (until they got the answer or gave up)
 * @property {boolean} gaveUp - The boolean that represents if the user gave up
 */
/**
 * @typedef {Object} UserObject - Object used to store information in the localStorage
 * @property {string} username - The username of a user
 * @property {string} email - The email address of a user
 * @property {string} password - The password of a user
 * @property {UserSettings} settings - The settings of a user
 * @property {Object.<number, UserGuess>} guesses - The anime character guesses of a user
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