// Update website based on game logic
import { getAnimeList, getAnimeCharacters, getAnimeCharacterFullInfo } from "../scripts/apicalls.js";
import Overlay from "./Overlay.js";
import { hideDescription, showDescription, getUsers } from "../scripts/functions.js";
import Slideshow from "./Slideshow.js";
import { animeSelector, form, guessButton, solvedDiv, statsDiv, randomizeButton, giveUpButton, getInfoButton, navLoginSignUpDiv, navSignOutDiv } from "../constants/selectors.js";
import Settings from "./Settings.js";
import User from "./User.js";

/**
 * Represents the object containing all information on an anime
 * @typedef {Object} AnimeData
 * @property {object} info - General info about the anime
 * @property {object[]} mainChars - An array of main characters
 * @property {object[]} allChars - An array of all characters
 */

/**
 * Represents the game
 */
export default class Game {
    /**
     * Store anime data in an object
     * @type {Object.<number, AnimeData>}
     */
    #animeInfo = {};
    /**
     * Store acceptable answers for each anime character in this obj. { mal_id: [ { answers: set, display: string } ] } Each index corresponds to that character's index in the array animeInfo[mal_id].mainChars
     */
    #animeCharacterAnswers = {};
    /**
     * User instance
     */
    #user;
    /**
     * Slideshow instance
     */
    #slideshow;
    /**
     * Overlay instance
     */
    #overlay;
    /**
     * Settings instance related to the user
     */
    #settings;
    /**
     * Game state; true for game started, false for game not started
    */
    #gameStarted;

    #index;
    /**
     * 
     * @param {User} user User instance
     */
    constructor(user) {
        this.#user = user;
        this.#gameStarted = false;
        this.#settings = new Settings(user);
        this.#overlay = new Overlay(user, this.#settings);
        this.#slideshow = new Slideshow();
    }

    get user() {
        return this.#user;
    }

    get settings() {
        return this.#settings;
    }

    /**
     * @param {User} user 
     */
    set user(user) {
        // Update user references
        this.#user = user;
        this.#settings.user = user;
        this.#overlay.user = user;

        // Hide login signup
        navLoginSignUpDiv.classList.add("hidden");

        // Show profile and signout
        navSignOutDiv.classList.remove("hidden");

        // Randomize anime
        this.#chooseAnime();

        // Close the overlay
        this.#overlay.close();
    }

    /**
     * Starts the game by getting the list of anime, initializing event listeners, and creating the general structure for the user's guesses. This function only runs once.
     */
    async startGame() {
        try {
            if (!this.#gameStarted) {
                const animeList = await getAnimeList();

                // Populate anime selector with options
                this.#initSelector(animeList.data);

                // Create general structure for character answers and store anime data
                this.#initGameData(animeList.data);

                // Create general structure for user's guesses
                this.#initUserData();

                // Choose a random anime (do not provide an argument)
                await this.#chooseAnime();

                // Set up event listeners on website for static elements
                this.#setUpEventListeners();

                // Game started
                this.#gameStarted = true;
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Method used to choose the anime by interacting with the selector or to randomize the anime character and anime
     * @param {number} animeId - The mal_id of the anime
     */
    async #chooseAnime(animeId = this.#chooseRandomAnime()) {
        // Disable buttons until game is ready
        this.#toggleButtonState();

        animeSelector.value = animeId; // Update selector to show which anime the character is from

        let mainCharacters = [];
        if (this.#animeInfo[animeId].mainChars != null) { // Don't make the api call if main character data for this anime was already retrieved
            mainCharacters = this.#animeInfo[animeId].mainChars;
        } else {
            const characters = await getAnimeCharacters(animeId);
            mainCharacters = characters.data.filter(entry => entry.role === "Main");
            this.#animeInfo[animeId].mainChars = mainCharacters;
            this.#animeInfo[animeId].allChars = characters;
        }

        // Only init if the array representing the anime is empty
        if (this.#user.guesses[animeId].length === 0) {
            this.#user.initCharGuessesOfAnime(animeId, mainCharacters.length);
        }

        // Generate answers when this anime is used the first time
        if (this.#animeCharacterAnswers[animeId].length === 0) {
            this.#generateAnswers(animeId);
        }

        // Update the anime slideshow container. 
        const random = chooseRandomIndex();
        this.#slideshow.createSlideShow(this.#animeInfo[animeId], random);

        // Apply settings to slideshow
        this.#settings.loadAllSettings();

        // Enable buttons since game is ready
        this.#toggleButtonState();

        function chooseRandomIndex() {
            return Math.floor(Math.random() * mainCharacters.length) + 1;
        }
    }

    /**
     * Handles getting info on a particular anime character
     */
    async #getCharacterInfo() {
        getInfoButton.disabled = true;
        const characterMalId = this.#animeInfo[animeSelector.value].mainChars[this.#slideshow.index - 1].character.mal_id;
        const characterInfo = await getAnimeCharacterFullInfo(characterMalId);
        this.#overlay.show("characterInfo", characterInfo.data);
        getInfoButton.disabled = false;
    }

    /**
     * Initializes the game's anime selector
     * @param {Object[]} animeList - An array of anime-related objects.
     */
    #initSelector(animeList) {
        const frag = new DocumentFragment();
        animeList.forEach(anime => {
            frag.appendChild(Object.assign(document.createElement("option"), { id: anime.mal_id, value: anime.mal_id, textContent: anime.title_english || anime.title, classList: "anime-option" }));
        });
        animeSelector.appendChild(frag);
    }

    /**
     * Initializes the game's data
     * @param {Object[]} animeList - An array of anime-related objects.
     */
    #initGameData(animeList) {
        animeList.forEach(anime => {
            // Game data
            this.#animeInfo[anime.mal_id] = { info: anime, mainChars: null, allChars: null }; // populate the animeInfo obj
            this.#animeCharacterAnswers[anime.mal_id] = []; // initialize as empty arr
        });
    }

    /**
     * Initializes the user's data
     */
    #initUserData() {
        Object.keys(this.#animeInfo).forEach(animeId => {
            this.#user.initGuessesOfAnime(animeId);
        })
    }

    // Choose a random anime
    #chooseRandomAnime() {
        const animeMalIds = Object.keys(this.#animeInfo);
        return animeMalIds[Math.floor(Math.random() * animeMalIds.length)];
    }

    /**
     * Generates possible answers as a set and the answer to show when the user guesses correctly or gives up
     * @param {number} animeId - The mal id of the anime
     */
    #generateAnswers(animeId) {
        this.#animeInfo[animeId].mainChars.forEach(chr => {
            const correctName = chr.character.name.toLowerCase();
            const acceptableAnswers = new Set([correctName]);

            if (chr.character.nicknames != undefined) {
                nicknames.forEach(nickname => acceptableAnswers.add(nickname.toLowerCase()));
            }

            let displayCorrect = correctName;
            if (correctName.includes(",")) { // Most names are Last, First or Middle Names... Last, First
                const tempArr = correctName.split(",");
                const firstName = tempArr[tempArr.length - 1].slice(1);
                acceptableAnswers.add(firstName);
                displayCorrect = firstName + " " + tempArr.slice(0, -1).join(" ");
                acceptableAnswers.add(displayCorrect);
                if (tempArr.length === 2) {
                    acceptableAnswers.add(tempArr[0] + " " + firstName);
                }
            } else { // Case for names like "Name the Title"
                const filteredAnswerArr = correctName.split(" ");
                acceptableAnswers.add(filteredAnswerArr[0]);
            }
            this.#animeCharacterAnswers[animeId].push({ answers: acceptableAnswers, display: this.#upper(displayCorrect) });
        });
    }

    /**
     * Updates the stats and guess state for an anime character based on user interaction
     * @param {number} index - Represents the index of the anime character and slide index
     */
    updateStats() {
        const index = this.#slideshow.index - 1;
        const animeId = animeSelector.value;
        const gaveUp = this.#user.gaveUp(animeId, index);
        statsDiv.children[0].textContent = gaveUp ? `You gave up!` : `Guesses: ${this.#user.getGuessCount(animeId, index)}`;
        statsDiv.children[1].textContent = `Guessed: ${this.#user.getSolvedCount(animeId)}/${this.#animeInfo[animeId].mainChars.length}`;
        updateGuessState(this.#animeCharacterAnswers[animeId][index].display, this.#user);

        // Hides user input form if character is guessed and shows answer.
        function updateGuessState(answer, user) {
            if (user.hasAnswer(animeId, index) || gaveUp) { // Case for solved or gave up
                form.classList.add("hidden");
                solvedDiv.classList.remove("hidden");
                solvedDiv.querySelector("p").textContent = answer;
                giveUpButton.classList.add("hidden");
                getInfoButton.classList.remove("hidden");
            } else {
                form.classList.remove("hidden");
                solvedDiv.classList.add("hidden");
                giveUpButton.classList.remove("hidden");
                getInfoButton.classList.add("hidden");
            }
        }
    }

    /**
     * Makes the first letter of each word uppercase (assuming words separated by spaces)
     * @param {string} name Anime Character's name
     * @returns {string} String with the first letter of each word uppercase
     */
    #upper(name) {
        const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi"];
        const arr = name.split(" ");
        for (let i = 0; i < arr.length; i++) {
            if (romanNumerals.includes(arr[i])) {
                arr[i] = arr[i].toUpperCase();
            } else {
                arr[i] = upperCase(arr[i]);
            }
        }
        return arr.join(" ");

        function upperCase(string) {
            return string[0].toUpperCase() + string.slice(1);
        }
    }

    /**
     * Formats the user's answer while keeping any commas or dots by making the first letter of each word uppercase
     * @param {string} answer The user's correct answer
     * @returns {string} String with the first letter of each word as an uppercase
     */
    #formatAnswer(answer) {
        if (answer.includes(",")) { // last names..., first name
            const arr = answer.toLowerCase().split(",");
            const rightSide = arr[arr.length - 1].slice(1);
            const leftSide = upper(arr[0])

            return `${leftSide}, ${this.#upper(rightSide)}`;
        } else {
            return this.#upper(answer);
        }
    }

    // Event listener-related functions

    /**
     * Sets up all event listeners for static elements on the website
     */
    #setUpEventListeners() {
        // Add event listeners to the randomize button
        randomizeButton.addEventListener("click", () => this.#chooseAnime());
        this.#addDescriptionEvent(randomizeButton);

        // Add event listeners to the give up button
        giveUpButton.addEventListener("click", () => this.#handleGiveUp())
        this.#addDescriptionEvent(giveUpButton);

        // Add event listeners to the get info button
        getInfoButton.addEventListener("click", () => this.#getCharacterInfo());
        this.#addDescriptionEvent(getInfoButton);

        // Add event listener to the selector
        animeSelector.addEventListener("change", (e) => this.#chooseAnime(e.target.value));

        // Add event listener to check user's answer
        guessButton.addEventListener("click", (e) => this.#checkAnswers(e));

        // Add event listener to sign out
        document.getElementById("signout-nav").addEventListener("click", () => this.#signout());
    }

    /**
     * Show description upon hovering over the button
     * @param {HTMLButtonElement} button - The button that needs a description
     */
    #addDescriptionEvent(button) {
        button.addEventListener("mouseover", showDescription);
        button.addEventListener("mouseout", hideDescription);
    }

    /**
     * Handles user giving up on guessing the anime character
     */
    #handleGiveUp() {
        this.#user.giveUp(animeSelector.value, this.#slideshow.index - 1);
        this.updateStats();
    }

    /**
     * Checks if the user's answer is correct
     * @param {MouseEvent} e - The MouseEvent from clicking the button
     * @returns 
     */
    #checkAnswers(e) {
        e.preventDefault(); // Do not allow page refresh
        const userAnswer = form.elements["user-guess"];
        const animeId = animeSelector.value;

        // Ignore empty inputs
        if (userAnswer.value === "") {
            return;
        }
        const answers = this.#animeCharacterAnswers[animeId][this.#slideshow.index - 1].answers;
        // Increment guess
        this.#user.incrementGuess(animeId, this.#slideshow.index - 1);
        if (answers.has(userAnswer.value.toLowerCase())) {
            console.log("Correct answer!");
            this.#user.storeAnswer(animeId, this.#slideshow.index - 1, this.#formatAnswer(userAnswer.value.toLowerCase()));
        } else {
            console.log("Wrong answer");
        }
        form.reset();
        this.updateStats();
        this.#settings.loadAllSettings();
    }

    /**
     * Toggles the states of all game-related buttons
     */
    #toggleButtonState() {
        const buttons = [guessButton, randomizeButton, giveUpButton, getInfoButton];
        buttons.forEach(button => button.disabled = !button.disabled);
    }

    // User related methods

    /**
     * Saves user data
     * @param {string} username - The username provided
     * @param {string} password - The password provided
     * @param {string} settings - The settings provided
     * @param {string} guesses - The guesses provided
     */
    #saveUserData() {
        const userData = getUsers();
        for (const user of userData) {
            if (user.username === this.#user.username) {
                user.settings = this.#user.settings;
                user.guesses = this.#user.guesses;
                localStorage.setItem("users", JSON.stringify(userData));
            }
        }
    }

    /**
     * Handles user signing out
     */
    async #signout() {
        // Only sign out if the user was signed in
        if (this.#user.username != undefined) {
            // Show the login and signup
            navLoginSignUpDiv.classList.remove("hidden");

            // Hide profile and signout
            navSignOutDiv.classList.add("hidden");

            // Save user data
            this.#saveUserData();

            // Create a new guest user with no login credentials
            const user = new User();
            this.#user = user;
            this.#settings.user = user;
            this.#overlay.user = user;

            // Create general structure for character answers, user's guesses, and store anime data
            this.#initUserData();

            // Choose a random anime (do not provide an argument)
            await this.#chooseAnime();

            // Close the overlay
            this.#overlay.close();
        }
    }
}