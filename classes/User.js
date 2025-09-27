// Used to handle accessing existing users in local storage or creating new ones
import { defaultSettings } from "../constants/constants.js";
export default class User {
    #settings;
    #username;
    #email;
    #password;
    currentAnimeId;
    currentCharIndex;
    gameType;
    constructor(username, email, password) {
        this.#username = username;
        this.#email = email;
        this.#password = password;
        this.#settings = { ...defaultSettings };
    }

    get settings() {
        return this.#settings;
    }

    get username() {
        return this.#username;
    }
}
