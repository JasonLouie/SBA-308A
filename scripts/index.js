// Main file
import { defaultSettings } from "../constants/constants.js";
import { handleLoginSignUp, handleOpenNavElement } from "./overlay.js";
import { startGame } from "./game.js";

// Create a copy of the default settings for the user
export const userSettings = { ...defaultSettings };

async function initLoad() {
    setUpNavBarEventListeners();

    function setUpNavBarEventListeners() {
        const navAnchors = document.getElementsByClassName("nav-anchor");
        const navBtns = document.getElementsByClassName("nav-button");
        const animeButton = document.getElementById("anime");

        // Add event listener to the button
        animeButton.addEventListener("click", startGame);

        // Add event listeners for settings & instructions
        for (const navBtn of navBtns) {
            navBtn.addEventListener("click", handleOpenNavElement);
        }

        // Add event listeners for login & signup
        for (const navAnchor of navAnchors) {
            navAnchor.addEventListener("click", handleLoginSignUp);
        }
    }
}

initLoad();