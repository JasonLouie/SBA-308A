// Update website based on game logic
import { getAnimeList, getAnimeCharacters } from "../scripts/apicalls.js";
import { updateBlur, handleOpenLoginSignUp, handleOpenNavElement } from "../scripts/overlay.js";
import { emptyAnimeSlideshowContainer, updateAnimeSlideshowContainer, currentPicIndex as index } from "../scripts/slideshow.js";
import User, { user } from "./User.js";

const animeSelector = document.getElementById("anime-selector");
const form = document.getElementById("form-user-input");
const solvedDiv = document.getElementById("solved");
const statsDiv = document.getElementById("stats");

class Game {
    #animeInfo = {}; // Store anime data in an object { mal_id: {info: animeList.data, mainChars: [], allChars: [] } }
    #animeCharacterAnswers = {}; // Store acceptable answers for each anime character in this obj. (mal_id: [{acceptable answers set}]) Each index corresponds to that character's index in the array animeInfo[mal_id].mainChars
    #user;
    #gameStarted;
    #currentCharIndex;

    constructor() {
        this.#currentCharIndex = 0;
        this.#gameStarted = false;
    }

    set user(user) {
        this.#user = user;
    }

    get user() {
        return this.#user;
    }

    get currentCharIndex() {
        return this.#currentCharIndex;
    }

    // Starts the game by getting the list of anime, initializing event listeners, and This function should only run once
    async startGame() {
        try {
            if (!this.#gameStarted) {
                const animeList = await getAnimeList();

                // Populate anime selector with options
                this.#initSelector(animeList);

                // Create general structure for character answers, user's guesses, and store anime data
                this.#initData(animeList);

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

    // Method used to choose the anime by interacting with the selector
    async #chooseAnime(animeId = this.#chooseRandomAnime()) {
        animeSelector.value = animeId; // Update selector to show which anime the character is from

        let mainCharacters = [];

        if (this.#animeInfo[animeId].mainChars != null) { // Don't make the api call if main character data for this anime was already retrieved
            console.log("Accessing stored anime character info");
            mainCharacters = this.#animeInfo[animeId].mainChars;
        } else {
            console.log("Storing anime character info");
            const characters = await getAnimeCharacters(animeId);
            mainCharacters = characters.data.filter(entry => entry.role === "Main");
            this.#animeInfo[animeId].mainChars = mainCharacters;
            this.#animeInfo[animeId].allChars = characters;
        }

        // Init user's guess for the anime
        user.initCharGuessesOfAnime(animeId, mainCharacters.length);

        // Generate answers when this anime is used the first time
        if (this.#animeCharacterAnswers[animeId].length === 0) {
            console.log("Generating answers...")
            this.#generateAnswers(animeId);
        }

        // Empty the slideshow container
        emptyAnimeSlideshowContainer();

        // Update the anime slideshow container. 
        updateAnimeSlideshowContainer(this.#animeInfo[animeId]);

    }

    // Initialize Anime Selector with options
    #initSelector(animeList) {
        const frag = new DocumentFragment();
        animeList.data.forEach(anime => {
            frag.appendChild(Object.assign(document.createElement("option"), { id: anime.mal_id, value: anime.mal_id, textContent: anime.title, classList: "anime-option" }));
        });
        animeSelector.appendChild(frag);
    }

    // Initialize Game Data and User Data
    #initData(animeList) {
        animeList.data.forEach(anime => {
            // Game data
            this.#animeInfo[anime.mal_id] = { info: anime, mainChars: null, allChars: null }; // populate the animeInfo obj
            this.#animeCharacterAnswers[anime.mal_id] = []; // initialize as empty arr
            // User data
            user.initGuessesOfAnime(anime.mal_id);
        });
    }

    // Choose a random anime
    #chooseRandomAnime() {
        const animeMalIds = Object.keys(this.#animeInfo);
        return animeMalIds[Math.floor(Math.random() * animeMalIds.length)];
    }

    // Generate possible answers and return it as a set.
    #generateAnswers(animeId) {
        console.log(animeId);
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
            console.log(this.#upper(displayCorrect));
            this.#animeCharacterAnswers[animeId].push({ answers: acceptableAnswers, display: this.#upper(displayCorrect) });
        });
    }

    // Updates the stats
    updateStats() {
        const animeId = animeSelector.value;
        statsDiv.children[0].textContent = `Guesses: ${user.getGuessCount(animeId, index - 1)}`;
        statsDiv.children[1].textContent = `Guessed: ${user.getUnsolvedCount(animeId)}/${this.#animeInfo[animeId].mainChars.length}`;
        updateGuessState(this.#animeCharacterAnswers[animeId][index-1].display);

        // Hides user input form if character is guessed and shows answer.
        function updateGuessState(answer) {
            if (user.hasAnswer(animeId, index - 1)) { // Case for solved
                form.classList.add("hidden");
                solvedDiv.classList.remove("hidden");
                solvedDiv.querySelector("p").textContent = answer;
            } else {
                form.classList.remove("hidden");
                solvedDiv.classList.add("hidden");
            }
        }
    }

    // Makes the first letter of each word uppercase (assuming words separated by spaces)
    #upper(name) {
        const arr = name.split(" ");
        for (let i = 0; i < arr.length; i++) {
            arr[i] = upperCase(arr[i]);
        }

        return arr.join(" ");

        function upperCase(string) {
            return string[0].toUpperCase() + string.slice(1);
        }
    }

    // Ensure answer is stored with each first letter uppercase
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

    // Set up all event listeners on the website (for static elements)
    #setUpEventListeners() {
        // Add event listener to the button
        const randomizeButton = document.getElementById("randomize");
        randomizeButton.addEventListener("click", () => this.#chooseAnime());
        randomizeButton.addEventListener("mouseover", (e) => this.#showButtonDesc(e));
        randomizeButton.addEventListener("mouseout", (e) => this.#showButtonDesc(e));

        // Add event listener to the selector
        animeSelector.addEventListener("change", (e) => this.#chooseAnime(e.target.value));

        // Add event listener to check user's answer
        form.querySelector("button").addEventListener("click", (e) => this.#checkAnswers(e));

        // Add event listeners to navbar elements
        const navButtonDiv = document.getElementById("nav-buttons");
        const navAnchorDiv = document.getElementById("login-signup-nav");

        // Add event listeners for settings & instructions
        navButtonDiv.addEventListener("click", handleOpenNavElement);

        // Add event listeners for login & signup
        navAnchorDiv.addEventListener("click", handleOpenLoginSignUp);
    }

    // Event listener for showing tooltip for randomize button
    #showButtonDesc(e) {
        if (e.target === e.currentTarget) {
            e.target.children[0].classList.toggle("hidden");
        }
    }

    // Event listener for checking answers
    #checkAnswers(e) {
        e.preventDefault(); // Do not allow page refresh
        const userAnswer = form.elements["user-guess"];
        const animeId = animeSelector.value;

        // Ignore empty inputs
        if (userAnswer.value === "") {
            return;
        }
        const answers = this.#animeCharacterAnswers[animeId][index - 1].answers;
        // Increment guess
        user.incrementGuess(animeId, index - 1);
        if (answers.has(userAnswer.value.toLowerCase())) {
            console.log("Correct answer!");
            user.storeAnswer(animeId, index - 1, this.#formatAnswer(userAnswer.value.toLowerCase()));
        } else {
            console.log("Wrong answer");
        }
        form.reset();
        this.updateStats();
        updateBlur();
    }
}

const game = new Game();
export default game;