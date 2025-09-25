// Used to handle accessing existing users in local storage or creating new ones
export default class User {
    #settings;
    #username;
    #email;
    #password;
    constructor(username, email, password) {
        this.#username = username;
        this.#email = email;
        this.#password = password;
        this.#settings = {"dark-mode": true, "hints": true, "blur": false, "colors": true};
    }

    get settings() {
        return this.#settings;
    }

    get username() {
        return this.#username;
    }
}
