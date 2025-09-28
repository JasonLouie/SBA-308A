// Make a recursive function for creating elements given an array of objects
import overlayDict from "../constants/constants.js";
import { userSettings, userGuesses } from "./index.js";
import { currentPicIndex as index } from "./slideshow.js";

const slideshow = document.getElementById("slideshow");
const animeSelector = document.getElementById("anime-selector"); // Used to get the animeId
const overlayDiv = document.getElementById("overlay");

// Handle opening login or signup form
export function handleOpenLoginSignUp(e) {
    if (e.target.localName === "a") {
        e.preventDefault();
        createOverlay(e.target.textContent.replace(" ", "").toLowerCase());
    }
}

// Handle opening instructions and settings overlay
export function handleOpenNavElement(e) {
    if (e.target.classList.contains("nav-button")) {
        e.preventDefault();
        createOverlay(e.target.id.slice(0, -4));
    }
}

// Displays the overlay and creates the particular type
export function createOverlay(type) {
    overlayDiv.classList.remove("hidden");

    if (type === "login" || type === "signup") { // Login/signup form
        createForm(type);
    } else if (type === "settings") {
        createSettings();
    } else if (type === "instructions") {
        createInstructions();
    }

    // Creates the login or sign up form
    function createForm(type) {
        clearOverlay();
        const frag = new DocumentFragment();
        const formContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "form-container", classList: "div-menu-container" }));
        const form = formContainer.appendChild(Object.assign(document.createElement("form"), { id: `${type}-form` }));

        // Create h1 as a form type indicator
        form.appendChild(Object.assign(document.createElement("h1"), { textContent: `${overlayDict[type].buttonText}` }))

        // Create form mode indicator
        const formMode = form.appendChild(Object.assign(document.createElement("div"), { id: "form-mode" }));
        formMode.appendChild(Object.assign(document.createElement("p"), { classList: `form-type ${(type === "login") ? "selected" : "unselected"}`, textContent: "Login" }));
        formMode.appendChild(Object.assign(document.createElement("p"), { classList: `form-type ${(type === "signup") ? "selected" : "unselected"}`, textContent: "Sign Up" }));

        // Show logo only for login form
        if (type === "login") {
            form.appendChild(Object.assign(document.createElement("img"), { src: "", alt: "logo", id: "login-logo" }));
        }

        // Create inputs
        createInputs(overlayDict[type].inputs, form);

        // Create the submit button and recommendation
        form.appendChild(Object.assign(document.createElement("button"), { type: "submit", id: "form-submit", textContent: `${overlayDict[type].buttonText}`, classList: `${type}-btn` }));
        form.appendChild(Object.assign(document.createElement("p"), { id: "text-recommend", innerHTML: `${overlayDict[type].innerHTML}` }));
        overlayDiv.appendChild(frag);

        // Add event listener to the anchor tag of the form (to switch modes)
        overlayDiv.querySelector("a").addEventListener("click", handleOpenLoginSignUp);

        function createInputs(inputArr, parentElement) {
            for (const input of inputArr) {
                parentElement.appendChild(Object.assign(document.createElement("input"), input));
                if (input.name != "confirmPassword") {
                    parentElement.appendChild(Object.assign(document.createElement("p"), { id: `${input.name}Error`, classList: "field-error" }));

                }
            }
        }
    }

    // Creates the settings overlay
    function createSettings() {
        const frag = new DocumentFragment();

        // Create the container
        const settingsContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "settings-container", classList: "div-menu-container" }));

        // Create the h1
        settingsContainer.appendChild(Object.assign(document.createElement("h1"), { textContent: "Settings" }));

        // Create the div that holds all settings
        const settingsList = settingsContainer.appendChild(Object.assign(document.createElement("div"), { id: "settings-list" }));

        // Populate the div's contents
        overlayDict["settings"].forEach(setting => {
            // Outer div for setting
            const settingDiv = settingsList.appendChild(Object.assign(document.createElement("div"), { id: setting.id, classList: setting.classList }));

            // p containing name of the setting
            const settingName = settingDiv.appendChild(Object.assign(document.createElement("p"), { textContent: setting.textContent, classList: "setting-name" }));

            // Add tooltip to setting name
            settingName.appendChild(Object.assign(document.createElement("span"), { textContent: setting.description, classList: "setting-desc hidden" }));

            // Add event listener to show/hide tooltip
            settingName.addEventListener("mouseover", showToolTip);
            settingName.addEventListener("mouseout", showToolTip);

            // Create the option
            const optionDiv = settingDiv.appendChild(Object.assign(document.createElement("div"), { classList: `setting-option${(userSettings[setting.id]) ? " on" : ""}` }));
            const optionBtn = optionDiv.appendChild(Object.assign(document.createElement("button"), { classList: `setting-option-btn${(userSettings[setting.id]) ? " on" : ""}` }));

            // Add event listener to toggle setting on/off
            optionBtn.addEventListener("click", (e) => {
                if (e.target === e.currentTarget) {
                    e.target.classList.toggle("on");
                    e.target.parentElement.classList.toggle("on");
                    const setting = e.target.parentElement.parentElement.id;
                    userSettings[setting] = !userSettings[setting];
                    // Figure out how to handle multiple filters...
                    switch (setting) {
                        case "dark-mode":
                            document.body.classList.toggle("dark-mode");
                            break;
                        case "hints":
                            updateBlur();
                            break;
                        case "blur":
                            // Only add blur, if blur is true
                            updateBlur();
                            break;
                        case "colors":
                            const photos = slideshow.children;
                            for (const photo of photos) {
                                photo.classList.toggle("img-no-colors");
                            }                            
                            break;
                        default:
                            break;
                    }
                }
            });
        });
        overlayDiv.append(frag);

        function showToolTip(e) {
            if (e.target === e.currentTarget) {
                e.target.children[0].classList.toggle("hidden");
            }
        }
    }

    // Creates the instructions overlay
    function createInstructions() {
        const frag = new DocumentFragment();
        const divContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "instructions-container", classList: "div-menu-container" }));

        // Create h1 to inform user that these are the instructions
        divContainer.appendChild(Object.assign(document.createElement("h1"), { textContent: "How To Play" }));

        // Create p to explain how to play
        divContainer.appendChild(Object.assign(document.createElement("p"), { id: "instructions" }));

        overlayDiv.appendChild(frag);
    }
}

// Need to update this method to access the children elements of anime slideshow container
export function updateBlur() {
    const guessesObj = userGuesses[animeSelector.value];
    console.log(guessesObj);
    const photos = slideshow.children;
    const blurDict = { 0: "blur-xl", 1: "blur-lg", 2: "blur-md", 3: "blur-sm", 4: "blur-xs" };
    
    for (let i = 0; i < photos.length; i++) {
        if (userSettings.blur && guessesObj[i].userAnswer === null) {
            if (!userSettings.hints) { // Only use max blur if hints are off
                removeOldBlurs();
                photos[i].classList.add(blurDict[1]);
            } else {
                // Remove older blurs
                console.log(i, "guesses:", guessesObj[i].guessCount);
                removeOldBlurs(guessesObj[i].guessCount);
                // Apply blur if it exists
                if (blurDict[guessesObj[i].guessCount]){
                    photos[i].classList.add(blurDict[guessesObj[i].guessCount]);
                }
            }
        } else { // If blur is off, just reset class list
            photos[i].classList = "img-container fade";
        }
    }
    
    function removeOldBlurs(intensity=5) {
        for (let i = 0; i < intensity; i++) {
            slideshow.classList.remove(blurDict[i]);
        }
    }
}

function clearOverlay() {
    if (overlayDiv.firstElementChild) {
        overlayDiv.removeChild(overlayDiv.firstElementChild);
    }
}

overlayDiv.addEventListener("click", closeOverlay);

function closeOverlay(e) {
    if (e.target === e.currentTarget) {
        overlayDiv.classList.add("hidden");
        clearOverlay();
    }
}