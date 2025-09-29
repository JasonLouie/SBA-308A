// Update website based on game logic
import { getAnimeList, getAnimeCharacters, getAnimeCharacterFullInfo } from "../scripts/apicalls.js";
import { handleOpenLoginSignUp, handleOpenNavElement, handleShowCharacterInfo, hideDescription, showDescription } from "../scripts/overlay.js";
import { emptyAnimeSlideshowContainer, updateAnimeSlideshowContainer } from "../scripts/slideshow.js";
import { animeSelector, form, solvedDiv, statsDiv, randomizeButton, giveUpButton, getInfoButton, navButtonDiv, navAnchorDiv } from "../constants/selectors.js";
import { loadAllSettings } from "../scripts/settings.js";
import User, { user } from "./User.js";

class Game {
    #animeInfo = {}; // Store anime data in an object { mal_id: {info: animeList.data, mainChars: [], allChars: [] } }
    #animeCharacterAnswers = {}; // Store acceptable answers for each anime character in this obj. (mal_id: [{acceptable answers set}]) Each index corresponds to that character's index in the array animeInfo[mal_id].mainChars
    #user;
    #index;
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

    // Updates the stats
    updateStats(index = this.#index) {
        this.#index = index;
        const animeId = animeSelector.value;
        const gaveUp = user.gaveUp(animeId, index);
        statsDiv.children[0].textContent = gaveUp ? `You gave up!` : `Guesses: ${user.getGuessCount(animeId, index)}`;
        statsDiv.children[1].textContent = `Guessed: ${user.getUnsolvedCount(animeId)}/${this.#animeInfo[animeId].mainChars.length}`;
        updateGuessState(this.#animeCharacterAnswers[animeId][index].display);

        // Hides user input form if character is guessed and shows answer.
        function updateGuessState(answer) {
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
        // Add event listeners to the randomize button
        randomizeButton.addEventListener("click", () => this.#chooseAnime());
        this.#addDescriptionEvent(randomizeButton);

        // Add event listeners to the give up button
        giveUpButton.addEventListener("click", () => this.#handleGiveUp())
        this.#addDescriptionEvent(giveUpButton);

        // Add event listeners to the get info button
        getInfoButton.addEventListener("click", async () => this.#getCharacterInfo());
        this.#addDescriptionEvent(getInfoButton);

        // Add event listener to the selector
        animeSelector.addEventListener("change", (e) => this.#chooseAnime(e.target.value));

        // Add event listener to check user's answer
        form.querySelector("button").addEventListener("click", (e) => this.#checkAnswers(e));

        // Add event listeners for settings & instructions
        navButtonDiv.addEventListener("click", handleOpenNavElement);

        // Add event listeners for login & signup
        navAnchorDiv.addEventListener("click", handleOpenLoginSignUp);
    }

    async #getCharacterInfo() {
        const characterMalId = this.#animeInfo[animeSelector.value].mainChars[this.#index].character.mal_id;
        const characterInfo = await getAnimeCharacterFullInfo(characterMalId);
        handleShowCharacterInfo(characterInfo.data);
    }

    // Add description-related event listeners
    #addDescriptionEvent(button){
        button.addEventListener("mouseover", showDescription);
        button.addEventListener("mouseout", hideDescription);
    }

    #handleGiveUp() {
        user.giveUp(animeSelector.value, this.#index);
        this.updateStats();
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
        const answers = this.#animeCharacterAnswers[animeId][this.#index].answers;
        // Increment guess
        user.incrementGuess(animeId, this.#index);
        if (answers.has(userAnswer.value.toLowerCase())) {
            console.log("Correct answer!");
            user.storeAnswer(animeId, this.#index, this.#formatAnswer(userAnswer.value.toLowerCase()));
        } else {
            console.log("Wrong answer");
        }
        form.reset();
        this.updateStats();
        loadAllSettings();
    }
}

const game = new Game();
export default game;