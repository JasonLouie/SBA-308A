// Functionality for going through the slides
import { guess } from "./index.js";
export const animeSlideshowContainer = document.getElementById("anime-slideshow-container");

const dotNavigation = document.getElementById("slideshow-navigation");
const statsDiv = document.getElementById("stats");
const next = animeSlideshowContainer.querySelector(".next");
const prev = animeSlideshowContainer.querySelector(".prev");

let currentPicIndex = 1;

// Empties anime slideshow container
export function emptyAnimeSlideshowContainer() {
    while (animeSlideshowContainer.firstElementChild.localName != "a") {
        animeSlideshowContainer.removeChild(animeSlideshowContainer.firstElementChild);
    }
}

// Updates anime slideshow container. Add photos, but prepend to ensure anchor buttons stay at the end.
export function updateAnimeSlideshowContainer(animeInfo, generate=false) {
    const acceptableAnswers = [];
    const mainCharacters = animeInfo.mainChars;
    const slideshowFrag = new DocumentFragment();
    for (let i = 0; i < mainCharacters.length; i++) {
        const character = mainCharacters[i].character;

        // Create img container
        const imgContainer = slideshowFrag.appendChild(Object.assign(document.createElement("div"), { classList: "img-container fade hidden" }));

        // Create p element indicating character i / total main anime characters
        imgContainer.appendChild(Object.assign(document.createElement("p"), { classList: "photo-counter", textContent: `${i + 1}/${mainCharacters.length}` }));

        // Create the img
        imgContainer.appendChild(Object.assign(document.createElement("img"), { classList: "char-photo", alt: `Photo of Main Character from ${animeInfo.info.name}`, src: character.images.jpg.image_url }));

        // Generate acceptable answers for the character, then store it into the animeCharactersAnswers obj
        if (generate) {
            acceptableAnswers.push(generateAnswers(character));
        }

        // Create dots for dotNavigation
        const dot = dotNavigation.appendChild(Object.assign(document.createElement("span"), {classList: "dot"}));
        dot.addEventListener("click", () => showPic(currentPicIndex = i+1));
    }

    updateStats(mainCharacters.length);
    animeSlideshowContainer.prepend(slideshowFrag) // Prepend because the last two elements should always be the two anchor elements.
    console.log(animeSlideshowContainer);
    console.log(dotNavigation);
    showPic(1);
    return acceptableAnswers;
}

// Generate possible answers and return it as a set. NEED TO WORK ON THIS
function generateAnswers(answer) {
    const correctName = answer.name;
    const acceptableAnswers = new Set([correctName.toLowerCase()]);

    // Another edge case: any time there is a comma in long names, the first name is the last part, so include this as an answer only or the full name?
    if (correctName.includes(" ")) {
        const res = correctName.replace(",", "").split(" "); // Handle first last names
        if (res.length === 3) { // Edge case for Vash the Stampede
            if (res[1] === "the") {
                acceptableAnswers.add(res[0]); // Only add first name...
                return acceptableAnswers;
            }
        }
        res.forEach(answer => acceptableAnswers.add(answer.toLowerCase()));
    }
    return acceptableAnswers;
}

function updateStats(length) {
    console.log(statsDiv.children);
    statsDiv.children[0].textContent = `Guesses: ${guess}`;
    statsDiv.children[1].textContent = `Guessed: 0/${length}`;
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
}

next.addEventListener("click", () => buttonNavigate(1));
prev.addEventListener("click", () => buttonNavigate(-1));
