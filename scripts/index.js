// Main file
import { defaultSettings } from "../constants/constants.js";
import { handleLoginSignUp, handleOpenNavElement } from "./overlay.js";
import { startGame } from "./game.js";

// Create a copy of the default settings for the user
export const userSettings = { ...defaultSettings };

async function initLoad() {
    setUpNavBarEventListeners();

    startGame();

    function setUpNavBarEventListeners() {
        const navButtonDiv = document.getElementById("nav-buttons");
        const navAnchorDiv = document.getElementById("login-signup-nav");

        // Add event listeners for settings & instructions
        navButtonDiv.addEventListener("click", handleOpenNavElement);

        // Add event listeners for login & signup
        navAnchorDiv.addEventListener("click", handleLoginSignUp);
    }
}

initLoad();