// Make a recursive function for creating elements given an array of objects
import overlayDict from "../constants/constants.js";
import { overlayDiv } from "../constants/selectors.js";

export default class Overlay {
    #user;
    #settings;
    constructor(user, settings) {
        this.#user = user;
        this.#settings = settings;
    }
    // Handle opening login or signup form
    openLoginSignUp(e) {
        if (e.target.localName === "a") {
            e.preventDefault();
            this.#createOverlay(e.target.textContent.replace(" ", "").toLowerCase());
        }
    }
    
    // Handle opening instructions and settings overlay
    openNavElement(e) {
        if (e.target.classList.contains("nav-button")) {
            e.preventDefault();
            this.#createOverlay(e.target.id.slice(0, -4));
        }
    }
    
    // Creates and displays the character info
    createCharacterInfo(characterInfo) {
        overlayDiv.classList.remove("hidden");
        const frag = new DocumentFragment();
        const container = frag.appendChild(Object.assign(document.createElement("div"), { id: "anime-info-container", classList: "div-menu-container" }));
        container.appendChild(Object.assign(document.createElement("h1"), { textContent: `Character Information` }));
        const infoDiv = container.appendChild(Object.assign(document.createElement("div"), { id: "character-info" }));
        infoDiv.appendChild(Object.assign(document.createElement("p"), { id: "character-name", innerHTML: `<span class="info-heading">Name:</span> ${characterInfo.name}` }));
        infoDiv.appendChild(Object.assign(document.createElement("p"), { id: "kanji", innerHTML: `<span class="info-heading">Kanji:</span> ${characterInfo.name_kanji}` }));
        const voiceActorsDiv = infoDiv.appendChild(Object.assign(document.createElement("div"), { id: "voice-actors-div" }));
        createVAInfo("Japanese");
        createVAInfo("English");
        const imgDiv = container.appendChild(Object.assign(document.createElement("div"), { id: "info-photo-container" }));
        imgDiv.appendChild(Object.assign(document.createElement("img"), { src: characterInfo.images.jpg.image_url, alt: `Picture of ${characterInfo.name}` }));
        const aboutDiv = container.appendChild(Object.assign(document.createElement("div"), { id: "div-about" }));
        aboutDiv.appendChild(Object.assign(document.createElement("pre"), { id: "about", innerHTML: `<span class="info-heading">About</span>\n${characterInfo.about}` }));
        overlayDiv.append(frag);
    
        function createVAInfo(language) {
            const voiceActors = characterInfo.voices.filter(actor => actor.language === language);
            const ul = voiceActorsDiv.appendChild(Object.assign(document.createElement("ul"), { textContent: `${language} Voice Actor${(voiceActors.length === 1) ? "" : "s"}`, classList: "voice-actors-ul" }));
            voiceActors.forEach(voiceActor => {
                ul.appendChild(Object.assign(document.createElement("li"), { classList: "voice-actor", textContent: voiceActor.person.name }));
            });
        }
    }
    
    // Displays the overlay and creates the particular type
    #createOverlay(type) {
        overlayDiv.classList.remove("hidden");
    
        if (type === "login" || type === "signup") { // Login/signup form
            this.#createForm(type);
        } else if (type === "settings") {
            this.#createSettings();
        } else if (type === "instructions") {
            this.#createInstructions();
        }
    
    }
    
    // Creates the login or sign up form
    #createForm(type) {
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
    #createSettings() {
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
            settingName.addEventListener("mouseover", showDescription);
            settingName.addEventListener("mouseout", hideDescription);
    
            // Create the option
            const optionValue = (user.settings[setting.id]) ? " on" : "";
            const optionDiv = settingDiv.appendChild(Object.assign(document.createElement("div"), { classList: `setting-option${optionValue}` }));
            const optionBtn = optionDiv.appendChild(Object.assign(document.createElement("button"), { classList: `setting-option-btn${optionValue}` }));
    
            // Add event listener to toggle setting on/off
            optionBtn.addEventListener("click", (e) => {
                if (e.target === e.currentTarget) {
                    e.target.classList.toggle("on");
                    e.target.parentElement.classList.toggle("on");
                    const setting = e.target.parentElement.parentElement.id;
                    this.#settings.changeSetting(setting);
                }
            });
        });
        overlayDiv.append(frag);
    }
    
    // Creates the instructions overlay
    #createInstructions() {
        const frag = new DocumentFragment();
        const divContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "instructions-container", classList: "div-menu-container" }));
    
        // Create h1 to inform user that these are the instructions
        divContainer.appendChild(Object.assign(document.createElement("h1"), { textContent: "How To Play" }));
    
        // Create p to explain how to play
        divContainer.appendChild(Object.assign(document.createElement("p"), { id: "instructions" }));
    
        overlayDiv.appendChild(frag);
    }
    
    // Closes the overlay
    close(e) {
        if (e.target === e.currentTarget) {
            overlayDiv.classList.add("hidden");
            // Clears the overlay
            if (overlayDiv.firstElementChild) {
                overlayDiv.removeChild(overlayDiv.firstElementChild);
            }
        }
    }
}


export function showDescription(e) {
    if (e.target === e.currentTarget) {
        e.target.children[0].classList.remove("hidden");
    }
}

export function hideDescription(e) {
    if (e.target === e.currentTarget) {
        e.target.children[0].classList.add("hidden");
    }
}