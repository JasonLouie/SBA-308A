// Update website based on game logic
import { getAnimeList, getAnimeCharacters } from "./apicalls.js";
import { updateBlur } from "./overlay.js";
export let guess = 1;
const totalGuesses = 6;
const animePic = document.getElementById("anime-pic");
const animeSelector = document.getElementById("anime-selector");
const randomizeButton = document.getElementById("randomize");
const statsDiv = document.getElementById("stats");

const form = document.getElementById("user-input");

let answer = {};
let imagesGuessed = 0; // images guessed for the current anime might use an obj later...

// Will only happen once
export async function startGame() {
    const animeList = await getAnimeList();

    // Populate the anime selector with options
    initSelector();

    // Randomize the random photo
    await randomize();

    // Add event listener to the button
    randomizeButton.addEventListener("click", () => randomize());
    randomizeButton.addEventListener("mouseover", showButtonDesc);
    randomizeButton.addEventListener("mouseout", showButtonDesc);

    // Add event listener to the selector
    animeSelector.addEventListener("change", (e) => randomize(e.target.value));

    // Add event listener to check user's answer
    form.querySelector("button").addEventListener("click", checkAnswer);

    function showButtonDesc(e) {
        if (e.target === e.currentTarget) {
            e.target.children[0].classList.toggle("hidden");
        }
    }


    function checkAnswer(e) {
        e.preventDefault(); // Do not allow page refresh
        const userAnswer = form.elements["user-guess"];
        if (userAnswer.value === "") {
            return;
        }

        const answers = possibleAnswers();
        console.log(answers);
        if (answers.has(userAnswer.value.toLowerCase())){
            console.log("Correct answer!");
        } else {
            console.log("Wrong answer");
            guess++;
            updateBlur(); // Update blur!
        }
    }

    // Generate possible answers and return it as a set
    function possibleAnswers() {
        const correctName = answer.character.name;
        const acceptableAnswers = new Set([correctName.toLowerCase()]);
        // Another edge case: any time there is a comma in long names, the first name is the last part, so include this as an answer only or the full name?
        if (correctName.includes(" ")) {
            const res = correctName.replace(",", "").split(" "); // Handle first last names
            if (res.length === 3){ // Edge case for Vash the Stampede
                if (res[1] === "the") { 
                    acceptableAnswers.add(res[0]); // Only add first name...
                    return acceptableAnswers;
                }
            }
            res.forEach(answer => acceptableAnswers.add(answer.toLowerCase()));
        }
        return acceptableAnswers;
    }

    async function randomize(animeId=animeList.data[chooseRandomAnime()].mal_id) {
        guess = 1; // Reset guess count to 1 upon randomize
        animeSelector.value = animeId;

        const characters = await getAnimeCharacters(animeId);
        // console.log("-=-=-= Characters List =-=-=-");
        // console.log(characters);

        const mainCharacters = characters.data.filter(entry => entry.role === "Main");
        // console.log("List of main characters:\n", mainCharacters);
        
        const chosenCharacter = chooseRandomCharacter(mainCharacters);
        animePic.src = chosenCharacter.character.images.jpg.image_url;
        answer = chosenCharacter;
        console.log(answer.character.name);

        function chooseRandomCharacter() {
            const index = Math.floor(Math.random() * mainCharacters.length);
            return mainCharacters[index];
        }
    }

    function updateStats() {
        statsDiv.children[0].textContent = `Guesses: ${guess}/${totalGuesses}`;
        statsDiv.chldren[1].textContent = `Guessed: `
    }

    // Used once to initialize the selector
    function initSelector() {
        animeList.data.forEach(anime => {
            animeSelector.appendChild(Object.assign(document.createElement("option"), { id: anime.mal_id, value: anime.mal_id, textContent: anime.title, classList: "anime-option" }));
        });
    }

    // Chooses a random anime
    function chooseRandomAnime() {
        const index = Math.floor(Math.random() * animeList.data.length);
        return index;
    }
};

// What do I show? A picture of an anime character from a random anime.
// Retrieve the character from the result of characters after passing anime id in get req
// Get photos related to character id and show more hints using some data from the API

// Select the anime in selector.


// TO DO In order:
// Data persistence: store the images of those main characters in an object
// Progress persistence: save which image was guessed correctly (when going back to prev category, start from that image)
// Data cache kinda - once that random anime is chosen and the main characters are filtered, add to object (maybe mal_id: mainCharsArr)
// Only do api calls if this obj doesn't exist...
// Refactor game to show main characters in order.