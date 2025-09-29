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
    
    get username() {
        return this.#username;
    }
    
    get email() {
        return this.#email;
    }
    
    // Returns a copy of the user's settings
    get settings() {
        return { ...this.#settings };
    }

    // Will return a copy of user's character guesses
    get guesses() {
        return { ...this.#characterGuesses };
    }

    // Function used to verify login
    verifyPassword(password) {
        return this.#password === password;
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
            if (this.#characterGuesses[animeId][index].userAnswer === null && !this.gaveUp(animeId, index)) {
                this.#characterGuesses[animeId][index].userAnswer = answer;
            }
        }
    }

    // Only allow giving up if user hasn't solved the answer and if they haven't yet
    giveUp(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null && !this.gaveUp(animeId, index)) {
                this.#characterGuesses[animeId][index].gaveUp = true;
            }
        }
    }

    // Return whether the user gave up on guessing the anime
    gaveUp(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            return this.#characterGuesses[animeId][index].gaveUp;
        }
    }

    // Only increment the guess when the user hasn't found the answer yet
    incrementGuess(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            if (this.#characterGuesses[animeId][index].userAnswer === null && !this.gaveUp(animeId, index)) {
                this.#characterGuesses[animeId][index].guessCount++;
            }
        }
    }

    // Returns number of anime characters solved guessed for that anime
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

    // Returns number of guesses the user entered
    getGuessCount(animeId, index) {
        if (this.#animeExists(animeId) && this.#animeCharExists(animeId, index)) {
            return this.#characterGuesses[animeId][index].guessCount;
        }
        return -1; // Negative guess count for entry that doesn't exist
    }

    // Toggle the specific user setting
    toggleSetting(setting) {
        // Prevent referencing settings that don't exist
        if (this.#settings[setting] != undefined) {
            this.#settings[setting] = !this.#settings[setting];
        }
    }

    // Initialize empty array for a particular anime
    initGuessesOfAnime(animeId) {
        // Only allow initialization if the entry with key = animeId does not exist
        this.#characterGuesses[animeId] = this.#characterGuesses[animeId] || [];
    }

    // Update characterGuesses by initializing the object representing the user's guess for the character
    initCharGuessesOfAnime(animeId, numChars) {
        // Only allow initialization if that anime's character array of objs is empty
        if (this.#characterGuesses[animeId].length === 0) {
            for (let i = 0; i < numChars; i++) {
                this.#characterGuesses[animeId].push({ userAnswer: null, guessCount: 0, gaveUp: false });
            }
        }
    }
}