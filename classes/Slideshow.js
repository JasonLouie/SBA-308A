// Functionality for going through the slides
import { game } from "../scripts/index.js";
import { animeSlideshowContainer, answerDiv, dotNavigation, next, prev } from "../constants/selectors.js";

/**
 * Represents the anime slideshow
 */
export default class Slideshow {
    #currentPicIndex;
    constructor() {
        this.#currentPicIndex = 1;
        this.#setUpEventListeners();
    }

    get index() {
        return this.#currentPicIndex;
    }

    /**
     * Clears the anime slideshow container and dot navigation container
     */
    #clear() {
        while (animeSlideshowContainer.firstElementChild) {
            animeSlideshowContainer.removeChild(animeSlideshowContainer.firstElementChild);
        }

        while (dotNavigation.firstElementChild) {
            dotNavigation.removeChild(dotNavigation.firstElementChild);
        }
    }

    /**
     * Updates anime slideshow container
     * @param {number} animeInfo - AnimeData object
     * @param {number} index - The index of the anime character that should be shown
     */
    createSlideShow(animeInfo, index = 1) {
        this.#clear();
        this.#currentPicIndex = index; // Start at the first photo each time unless given a random index
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
            imgContainer.appendChild(Object.assign(document.createElement("img"), { classList: "char-photo", alt: `Photo of Main Character from ${animeInfo.info.title_english || animeInfo.info.title}`, src: character.images.jpg.image_url }));
            
            // Create dots for dotNavigation
            const dot = dotFrag.appendChild(Object.assign(document.createElement("span"), { classList: "dot" }));
            dot.addEventListener("click", () => this.#showPic(this.#currentPicIndex = i + 1));
        }

        animeSlideshowContainer.prepend(slideshowFrag) // Prepend because the last two elements should always be the two anchor elements.
        dotNavigation.appendChild(dotFrag);
        this.#showPic(this.#currentPicIndex);
    }

    /**
     * Handles slideshow navigation with a num relative to the current photo
     * @param {number} num - The offset in relation to the current photo
     */
    #buttonNavigate(num) {
        this.#showPic(this.#currentPicIndex += num);
    }

    /**
     * Hides all pictures and unselects all dots
     */
    #hidePicsAndDots() {
        const photos = animeSlideshowContainer.querySelectorAll(".img-container");
        photos.forEach(photo => photo.classList.add("hidden"));

        const dots = document.getElementsByClassName("dot");
        for (const dot of dots) {
            dot.classList.remove("dot-selected");
        }
    }

    /**
     * Shows the picture at the particular position, num
     * @param {number} num - The position of the photo
     */
    #showPic(num) {
        const photos = document.getElementsByClassName("img-container");
        const dots = document.getElementsByClassName("dot");

        // Keep currentPicIndex in bounds (1 to num of photos, inclusively)
        if (num < 1) {
            this.#currentPicIndex = photos.length;
        } else if (num > photos.length) {
            this.#currentPicIndex = 1;
        }

        this.#hidePicsAndDots();

        // Reset the classes for answerDiv
        answerDiv.classList.remove("gaveUp");
        answerDiv.classList.remove("solved");

        photos[this.#currentPicIndex - 1].classList.remove("hidden");
        dots[this.#currentPicIndex - 1].classList.add("dot-selected");
        game.updateStats();
    }

    /**
     * Adds event listeners to the arrow buttons for functionality
     */
    #setUpEventListeners() {
        next.addEventListener("click", () => this.#buttonNavigate(1));
        prev.addEventListener("click", () => this.#buttonNavigate(-1));
    }
}