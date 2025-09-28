// Used to handle accessing existing users in local storage or creating new ones
import { defaultSettings } from "../constants/constants.js";
export default class User {
    #settings;
    #username;
    #email;
    #password;
    #characterGuesses;
    currentAnimeId;
    currentCharIndex;
    gameType;

    constructor(username, email, password, settings = { ...defaultSettings }, guesses = {}) {
        this.#username = username;
        this.#email = email;
        this.#password = password;
        this.#settings = settings;
        this.#characterGuesses = guesses; // characters guessed for the current anime as an obj (mal_id: [{userAnswer: user_valid_guess, guessesTook: guess}])
    }

    get settings() {
        return { ...this.#settings };
    }

    get username() {
        return this.#username;
    }

    get email() {
        return this.#email;
    }

    // Will return a copy of user's character guesses
    get guesses() {
        return { ...this.#characterGuesses };
    }

    #animeExists(animeId) {
        return this.#characterGuesses[animeId] != undefined;
    }

    #animeCharExists(animeId, index) {
        return this.#characterGuesses[animeId][index] != undefined;
    }

    hasAnswer(animeId, index){
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)){
            return this.#characterGuesses[animeId][index].userAnswer != null;
        }
        return false; // Entry doesn't exist so it would be false
    }

    // Only store answer if there wasn't an answer
    storeAnswer(animeId, index, answer) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null) {
                this.#characterGuesses[animeId][index].userAnswer = answer;
            }
        }
    }

    // Only increment the guess when the user hasn't found the answer yet
    incrementGuess(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null) {
                this.#characterGuesses[animeId][index].guessCount++;
            }
        }
    }

    getUnsolvedCount(animeId) {
        let solved = 0;
        if (this.#animeExists(animeId)) {
            this.#characterGuesses[animeId].forEach(guess => {
                if (guess.userAnswer != null) {
                    solved++;
                }
            });
        }
        return solved;
    }

    getGuessCount(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            return this.#characterGuesses[animeId][index].guessCount;
        }
    }

    // Toggle the specific user setting
    toggleSetting(setting) {
        if (this.#settings[setting]) {
            this.#settings[setting] = !this.#settings[setting];
        }
    }

    // Return a copy of user's guess for anime
    getGuessesForAnime(animeId) {
        return [...this.#characterGuesses[animeId]];
    }

    initGuessesOfAnime(animeId) {
        if (this.#characterGuesses[animeId] === undefined) {
            this.#characterGuesses[animeId] = [];
        }
    }

    initCharGuessesOfAnime(animeId, length) {
        // Update userGuesses by initializing the object representing the user's guess for the character
        if (this.#characterGuesses[animeId].length < length) {
            for (let i = 0; i < length; i++) {
                this.#characterGuesses[animeId].push({ userAnswer: null, guessCount: 0 });
            }
        }
    }
}

export const user = new User();