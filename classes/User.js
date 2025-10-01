// Used to handle users playing the game. Local storage stores users as objects instead
import { defaultSettings } from "../constants/constants.js";
/**
 * Represents the object container a guess for a particular anime main character
 * @typedef {Object} UserGuess
 * @property {null | string} userAnswer - The valid guess provided by the user
 * @property {number} guessesTook - The number of guesses the user used (until they got the answer or gave up)
 * @property {boolean} gaveUp - The boolean that represents if the user gave up
 */

/**
 * Handles data for the user
 */
export default class User {
    #settings;
    #username;
    #email;
    /**
     * Represents the object containing the user's valid guess for all anime main characters
     * @type {Object.<number, UserGuess>}
     */
    #characterGuesses;

    constructor(username, email, settings = { ...defaultSettings }, guesses = {}) {
        this.#username = username;
        this.#email = email;
        this.#settings = settings;
        this.#characterGuesses = guesses;
    }

    get username() {
        return this.#username;
    }

    get email() {
        return this.#email;
    }

    /**
     * Returns a copy of the user's settings
     */
    get settings() {
        return { ...this.#settings };
    }

    /**
     * Returns a copy of the user's character guesses
     */
    get guesses() {
        return { ...this.#characterGuesses };
    }

    /**
     * Checks if an anime with animeId exists in the user's character guesses
     * @param {number} animeId - The mal_id of the anime
     * @returns 
     */
    #animeExists(animeId) {
        return this.#characterGuesses[animeId] != undefined;
    }
    
    /**
     * Checks if an anime character with animeId and index exists in the user's character guesses
     * @param {number} animeId - The mal_id of the anime
     * @param {number} index - The index of the character
     * @returns 
     */
    #animeCharExists(animeId, index) {
        return this.#characterGuesses[animeId][index] != undefined;
    }

    /**
     * Checks if the user gave a valid answer for a particular anime character
     * @param {number} animeId 
     * @param {number} index 
     * @returns {boolean}
     */
    hasAnswer(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            return this.#characterGuesses[animeId][index].userAnswer != null;
        }
        return false; // Entry doesn't exist so it would be false
    }

    /**
     * Stores the successful user guess in the characterGuesses object
     * @param {number} animeId 
     * @param {number} index 
     */
    storeAnswer(animeId, index, answer) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null && !this.gaveUp(animeId, index)) {
                this.#characterGuesses[animeId][index].userAnswer = answer;
            }
        }
    }

    /**
     * Used when the user gives up on guessing the anime character. Only allows giving up if user hasn't solved the answer and if they haven't given up yet
     * @param {number} animeId 
     * @param {number} index 
     */
    giveUp(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null && !this.gaveUp(animeId, index)) {
                this.#characterGuesses[animeId][index].gaveUp = true;
            }
        }
    }

    /**
     * Returns whether the user gave up on guessing the anime character
     * @param {number} animeId 
     * @param {number} index 
     * @returns 
     */
    gaveUp(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            return this.#characterGuesses[animeId][index].gaveUp;
        }
    }

    // 
    /**
     * Increment the guessCount when the user hasn't found the answer yet and if they haven't given up yet.
     * @param {number} animeId 
     * @param {number} index 
     */
    incrementGuess(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null && !this.gaveUp(animeId, index)) {
                this.#characterGuesses[animeId][index].guessCount++;
            }
        }
    }

    /**
     * Returns number of anime characters solved guessed for that anime if it exists. Otherwise it returns -1
     * @param {number} animeId 
     * @returns {number}
     */
    getSolvedCount(animeId) {
        if (this.#animeExists(animeId)) {
            let solved = 0;
            this.#characterGuesses[animeId].forEach(guess => {
                if (guess.userAnswer != null && !guess.gaveUp) {
                    solved++;
                }
            });
            return solved;
        } else {
            return -1; // Negative solved count for entry that doesn't exist
        }
    }

    /**
     * Returns the guess count of an anime's main character if they exist. Otherwise it returns -1
     * @param {number} animeId 
     * @param {number} index
     * @returns {number}
     */
    getGuessCount(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            return this.#characterGuesses[animeId][index].guessCount;
        }
        return -1; // Negative guess count for entry that doesn't exist
    }

    /**
     * Toggles the specific user setting
     * @param {"dark-mode" | "hints" | "blur" | "colors"} setting - Setting being changed
     */
    toggleSetting(setting) {
        // Prevent referencing settings that don't exist
        if (this.#settings[setting] != undefined) {
            this.#settings[setting] = !this.#settings[setting];
        }
    }

    /**
     * Initializes empty array for a particular anime
     * @param {number} animeId 
     */
    initGuessesOfAnime(animeId) {
        // Only allow initialization if the entry with key = animeId does not exist
        this.#characterGuesses[animeId] = this.#characterGuesses[animeId] || [];
    }

    /**
     * Updates characterGuesses by initializing the object representing the user's guess for the character
     * @param {number} animeId 
     * @param {number} numChars 
     */
    initCharGuessesOfAnime(animeId, numChars) {
        // Only allow initialization if that anime's character array of objs is empty
        if (this.#characterGuesses[animeId].length === 0) {
            for (let i = 0; i < numChars; i++) {
                this.#characterGuesses[animeId].push({ userAnswer: null, guessCount: 0, gaveUp: false });
            }
        }
    }
}