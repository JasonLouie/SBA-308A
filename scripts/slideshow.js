// Functionality for going through the slides
import { userGuesses } from "./index.js";
import { updateBlur } from "./overlay.js";
export const animeSlideshowContainer = document.getElementById("slideshow");

const dotNavigation = document.getElementById("slideshow-navigation");
const statsDiv = document.getElementById("stats");
const next = document.getElementById("slideshow-next");
const prev = document.getElementById("slideshow-prev");
const form = document.getElementById("form-user-input");
const solvedDiv = document.getElementById("solved");

export let currentPicIndex = 1;
let animeId = null;

// Empties anime slideshow container
export function emptyAnimeSlideshowContainer() {
    while (animeSlideshowContainer.firstElementChild) {
        animeSlideshowContainer.removeChild(animeSlideshowContainer.firstElementChild);
    }

    while(dotNavigation.firstElementChild) {
        dotNavigation.removeChild(dotNavigation.firstElementChild);
    }
}

// Updates anime slideshow container. Add photos, but prepend to ensure anchor buttons stay at the end.
export function updateAnimeSlideshowContainer(animeInfo, generate=false) {
    animeId = animeInfo.info.mal_id;
    currentPicIndex = 1; // Start at the first photo each time
    const acceptableAnswers = [];
    const mainCharacters = animeInfo.mainChars;
    const slideshowFrag = new DocumentFragment();
    const dotFrag = new DocumentFragment();

    for (let i = 0; i < mainCharacters.length; i++) {
        const character = mainCharacters[i].character;

        // Update userGuesses by initializing the object representing the user's guess for the character
        if (userGuesses[animeId].length < mainCharacters.length){ // Only if it must be initialized.
            userGuesses[animeId].push({userAnswer: null, guessCount: 0});
        }

        // Create img container
        const imgContainer = slideshowFrag.appendChild(Object.assign(document.createElement("div"), { classList: "img-container fade hidden" }));

        // Create p element indicating character i / total main anime characters
        imgContainer.appendChild(Object.assign(document.createElement("p"), { classList: "photo-counter", textContent: `${i + 1}/${mainCharacters.length}` }));

        // Create the img
        imgContainer.appendChild(Object.assign(document.createElement("img"), { classList: "char-photo", alt: `Photo of Main Character from ${animeInfo.info.name}`, src: character.images.jpg.image_url }));

        // Generate acceptable answers for the character, then store it into the animeCharactersAnswers obj
        if (generate) {
            acceptableAnswers.push(generateAnswers(character.name, character.nicknames));
        }

        // Create dots for dotNavigation
        const dot = dotFrag.appendChild(Object.assign(document.createElement("span"), {classList: "dot"}));
        dot.addEventListener("click", () => showPic(currentPicIndex = i+1));
    }

    animeSlideshowContainer.prepend(slideshowFrag) // Prepend because the last two elements should always be the two anchor elements.
    dotNavigation.appendChild(dotFrag);
    showPic(1);
    updateBlur();
    return acceptableAnswers;
}

// Generate possible answers and return it as a set. NEED TO WORK ON THIS
function generateAnswers(answer, nicknames) {
    const correctName = answer.toLowerCase();
    const acceptableAnswers = new Set([correctName]);
    
    if (nicknames){
        nicknames.forEach(nickname => acceptableAnswers.add(nickname.toLowerCase()));
    }

    if (correctName.includes(",")){ // Most names are Last, First or Middle Names... Last, First
        const tempArr = correctName.split(",");
        const firstName = tempArr[tempArr.length-1].slice(1);
        acceptableAnswers.add(firstName);
        acceptableAnswers.add(firstName + " " + tempArr.slice(0,-1).join(" "));
        if (tempArr.length === 2){
            acceptableAnswers.add(tempArr[0] + " " + firstName);
        } 
    }

    const filteredAnswerArr = correctName.replace(",", "").split(" ");
    if (filteredAnswerArr.includes("the")) { // Edge case for names like Vash the Stampede should have that string or vash as the answer
        acceptableAnswers.add(filteredAnswerArr[0]);
        return acceptableAnswers;
    }
    return acceptableAnswers;
}

export function updateStats() {
    statsDiv.children[0].textContent = `Guesses: ${userGuesses[animeId][currentPicIndex-1].guessCount}`;
    statsDiv.children[1].textContent = `Guessed: ${calcSolved()}/${userGuesses[animeId].length}`;
    updateGuessState();

    function calcSolved() {
        let solved = 0;
        userGuesses[animeId].forEach(guess => {
            if (guess.userAnswer != null){
                solved++;
            }
        });
        return solved;
    }
}

// Hides user input form if character is guessed and shows answer.
export function updateGuessState() {
    const userAnswer = userGuesses[animeId][currentPicIndex-1].userAnswer;
    if (userAnswer != null){ // Case for solved
        form.classList.add("hidden");
        solvedDiv.classList.remove("hidden");
        solvedDiv.querySelector("p").textContent = userAnswer;
    } else {
        form.classList.remove("hidden");
        solvedDiv.classList.add("hidden");
    }
}

function buttonNavigate(num) {
    showPic(currentPicIndex += num);
}

function hidePicsAndDots() {
    const photos = animeSlideshowContainer.querySelectorAll(".img-container");
    photos.forEach(photo => photo.classList.add("hidden"));

    const dots = document.getElementsByClassName("dot");
    for (const dot of dots) {
        dot.classList.remove("dot-selected");
    }
}

function showPic(num) {
    const photos = document.getElementsByClassName("img-container");
    const dots = document.getElementsByClassName("dot");

    // Keep currentPicIndex in bounds (1 to num of photos, inclusively)
    if (num < 1) {
        currentPicIndex = photos.length;
    } else if (num > photos.length) {
        currentPicIndex = 1;
    }

    hidePicsAndDots();
    
    photos[currentPicIndex-1].classList.remove("hidden");
    dots[currentPicIndex-1].classList.add("dot-selected");
    updateStats();
}

next.addEventListener("click", () => buttonNavigate(1));
prev.addEventListener("click", () => buttonNavigate(-1));
