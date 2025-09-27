// Update website based on game logic
import { getAnimeList, getAnimeCharacters } from "../scripts/apicalls.js";
import { updateBlur, handleLoginSignUp, handleOpenNavElement } from "../scripts/overlay.js";
import { emptyAnimeSlideshowContainer, updateAnimeSlideshowContainer } from "../scripts/slideshow.js";

const animeSelector = document.getElementById("anime-selector");
const form = document.getElementById("form-user-input");

class Game {
    #animeInfo = {}; // Store anime data in an object { mal_id: {info: animeList.data, mainChars: [], allChars: [] } }
    #charactersGuessed = {}; // characters guessed for the current anime as an obj (mal_id: [{userAnswer: valid_guess, guessesTook: guess}])
    #animeCharacterAnswers = {}; // Store acceptable answers for each anime character in this obj. (mal_id: [{acceptable answers set}]) Each index corresponds to that character's index in the array animeInfo[mal_id].mainChars
    #user;
    #guess;
    #gameStarted;
    #currentCharIndex;

    constructor(user) {
        this.#user = user;
        this.#guess = 1;
        this.#currentCharIndex = 0;
        this.#gameStarted = false;
    }

    get user() {
        return this.#user;
    }

    get guess() {
        return this.#guess;
    }

    get currentCharIndex() {
        return this.#currentCharIndex;
    }

    // Starts the game by getting the list of anime, initializing event listeners, and This function should only run once
    async startGame() {
        if (!this.#gameStarted){
            const animeList = await getAnimeList();

            // Populate anime selector with options, store anime info, init characters guessed
            this.#initSelector(animeList);

            // Randomize
            await this.#randomize();

            // Set up event listeners on website for static elements
            this.#setUpEventListeners();

            // Game started
            this.#gameStarted = true;
        }
    }

    async #randomize(animeId = this.#chooseRandomAnime()) {
        this.#guess = 1; // Reset guess count based on the anime (for now just make it 1)
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

        // Empty the slideshow container except for the 2 anchor elements for next and prev
        emptyAnimeSlideshowContainer();

        // Update the anime slideshow container. Initialize entry if needed
        if (this.#animeCharacterAnswers[animeId].length === 0) {
            this.#animeCharacterAnswers[animeId] = updateAnimeSlideshowContainer(this.#animeInfo[animeId], true);
        } else {
            updateAnimeSlideshowContainer(this.#animeInfo[animeId]);
        }        
    }

    #chooseRandomAnime() {
        const animeMalIds = Object.keys(this.#animeInfo);
        return animeMalIds[Math.floor(Math.random() * animeMalIds.length)];
    }

    // Initialize Anime Selector with options & anime data
    #initSelector(animeList) {
        const frag = new DocumentFragment();
        animeList.data.forEach(anime => {
            this.#animeInfo[anime.mal_id] = { info: anime, mainChars: null, allChars: null }; // populate the animeInfo obj
            this.#animeCharacterAnswers[anime.mal_id] = []; // initialize as empty arr
            this.#charactersGuessed[anime.mal_id] = []; // populate with key: empty arr
            frag.appendChild(Object.assign(document.createElement("option"), { id: anime.mal_id, value: anime.mal_id, textContent: anime.title, classList: "anime-option" }));
        });
        animeSelector.appendChild(frag);
    }

    // Event listener-related functions

    // Set up all event listeners on the website (for static elements)
    #setUpEventListeners() {
        // Add event listener to the button
        const randomizeButton = document.getElementById("randomize");
        randomizeButton.addEventListener("click", () => this.#randomize());
        randomizeButton.addEventListener("mouseover", (e) => this.#showButtonDesc(e));
        randomizeButton.addEventListener("mouseout", (e) => this.#showButtonDesc(e));

        // Add event listener to the selector
        animeSelector.addEventListener("change", (e) => this.#randomize(e.target.value));

        // Add event listener to check user's answer
        form.querySelector("button").addEventListener("click", (e) => this.#checkAnswers(e));

        // Add event listeners to navbar elements
        const navButtonDiv = document.getElementById("nav-buttons");
        const navAnchorDiv = document.getElementById("login-signup-nav");

        // Add event listeners for settings & instructions
        navButtonDiv.addEventListener("click", handleOpenNavElement);

        // Add event listeners for login & signup
        navAnchorDiv.addEventListener("click", handleLoginSignUp);
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
        // Ignore empty inputs
        if (userAnswer.value === "") {
            return;
        }

        const answers = this.#animeCharacterAnswers[animeId][currentCharIndex];
        console.log(answers);
        if (answers.has(userAnswer.value.toLowerCase())) {
            console.log("Correct answer!");
            charactersGuessed[animeId][currentCharIndex] = { userAnswer: userAnswer, guessesTook: guess }; // Store user's answer 
        } else {
            console.log("Wrong answer");
            guess++;
            updateBlur(); // Update blur!
        }
    }
}

export default Game;

// TO DO In order:
// DONE Data persistence: store the images of those main characters in an object
// TO DO Progress persistence: save which image was guessed correctly (when going back to prev category, start from that image)
// DONE Data cache kinda - once that random anime is chosen and the main characters are filtered, add to object (maybe mal_id: mainCharsArr)
// DONE Only do api calls if this obj doesn't exist...
// TO DO Refactor game to show main characters in order.