// Functionality for going through the slides
import game from "../classes/Game.js";
import { animeSlideshowContainer, dotNavigation, next, prev } from "../constants/selectors.js";
import { loadAllSettings } from "./settings.js";

let currentPicIndex = 1;

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
export function updateAnimeSlideshowContainer(animeInfo) {
    currentPicIndex = 1; // Start at the first photo each time
    const mainCharacters = animeInfo.mainChars;
    const slideshowFrag = new DocumentFragment();
    const dotFrag = new DocumentFragment();

    for (let i = 0; i < mainCharacters.length; i++) {
        const character = mainCharacters[i].character;

        // Create img container
        const imgContainer = slideshowFrag.appendChild(Object.assign(document.createElement("div"), { classList: "img-container fade hidden" }));

        // Create p element indicating character i / total main anime characters
        imgContainer.appendChild(Object.assign(document.createElement("p"), { classList: "photo-counter", textContent: `${i + 1}/${mainCharacters.length}` }));

        // Create the img
        imgContainer.appendChild(Object.assign(document.createElement("img"), { classList: "char-photo", alt: `Photo of Main Character from ${animeInfo.info.title}`, src: character.images.jpg.image_url }));

        // Create dots for dotNavigation
        const dot = dotFrag.appendChild(Object.assign(document.createElement("span"), {classList: "dot"}));
        dot.addEventListener("click", () => showPic(currentPicIndex = i+1));
    }

    animeSlideshowContainer.prepend(slideshowFrag) // Prepend because the last two elements should always be the two anchor elements.
    dotNavigation.appendChild(dotFrag);
    showPic(1);
    loadAllSettings();
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
    game.updateStats(currentPicIndex-1);
}

// Add event listeners to the arrow buttons
next.addEventListener("click", () => buttonNavigate(1));
prev.addEventListener("click", () => buttonNavigate(-1));