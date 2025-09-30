// Make a recursive function for creating elements given an array of objects
import overlayDict from "../constants/constants.js";
import { instructionsBtn, navLoginSignUpDiv, overlayDiv, settingsBtn } from "../constants/selectors.js";
import { hideDescription, showDescription } from "../scripts/functions.js";
import { validateSignUpUsername, validateSignUpPassword, validateEmail, validateBothPasswords } from "../scripts/signup.js";

import { handleLogin, validateLogin } from "../scripts/login.js";
import { handleSignUp } from "../scripts/signup.js";
import Settings from "./Settings.js";
import User from "./User.js";

/**
 * Represents the overlay
 */
export default class Overlay {
    #user;
    #settings;

    /**
     * 
     * @param {User} user 
     * @param {Settings} settings 
     */
    constructor(user, settings) {
        this.#user = user;
        this.#settings = settings;
        this.#setUpEventListeners();
    }

    /**
     * @param {User} user
     */
    set user(user) {
        this.#user = user;
    }
    
    /**
     * Event listener that handles showing/hiding the 
     * @param {MouseEvent} e The MouseEvent that may open the form
     */
    #openLoginSignUp(e) {
        if (e.target.localName === "a") {
            e.preventDefault();
            this.show(e.target.textContent.replace(" ", "").toLowerCase());
        }
    }

    /**
     * Shows the overlay and some content
     * @param {string} type The type of content
     * @param {*} data Optional (contains the data to display)
     */
    show(type, data=undefined){
        overlayDiv.classList.remove("hidden");
        this.#clear();
        if (type === "characterInfo" && data != undefined) {
            this.#createCharacterInfo(data)
        } else if (type === "login" || type === "signup"){
            this.#createForm(type);
        } else if (type === "settings") {
            this.#createSettings();
        } else if (type === "instructions") {
            this.#createInstructions();
        }
    }
    
    /**
     * Creates the overlay that displays information on an anime character
     * @param {object} characterInfo The data fetched from the api call made in the game
     */
    #createCharacterInfo(characterInfo) {
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
    
    /**
     * Creates the login or sign up form
     * @param {string} type The type of form being created
     */
    #createForm(type) {
        const frag = new DocumentFragment();

        // Create the container for the form
        const formContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "form-container", classList: "div-menu-container" }));
        
        // Create the form
        const form = formContainer.appendChild(Object.assign(document.createElement("form"), { id: `${type}-form` }));
    
        // Create h1 as a form type indicator
        form.appendChild(Object.assign(document.createElement("h1"), { textContent: `${overlayDict[type].buttonText}` }))
    
        // Create form mode indicator
        const formMode = form.appendChild(Object.assign(document.createElement("div"), { id: "form-mode" }));
        formMode.appendChild(Object.assign(document.createElement("p"), { classList: `form-type ${(type === "login") ? "selected" : "unselected"}`, textContent: "Login" }));
        formMode.appendChild(Object.assign(document.createElement("p"), { classList: `form-type ${(type === "signup") ? "selected" : "unselected"}`, textContent: "Sign Up" }));
    
        // Show logo only for login form
        if (type === "login") {
            form.appendChild(Object.assign(document.createElement("div"), { id: "login-logo" }));
        }
    
        // Create inputs
        createInputs(overlayDict[type].inputs, form);
    
        // Create the submit button and recommendation
        const submitBtn = form.appendChild(Object.assign(document.createElement("button"), { type: "submit", id: "form-submit", textContent: `${overlayDict[type].buttonText}`, classList: `${type}-btn` }));
        form.appendChild(Object.assign(document.createElement("p"), { id: "text-recommend", innerHTML: `${overlayDict[type].innerHTML}` }));
        overlayDiv.appendChild(frag);
        
        // Add event listener to the submit button of the form (to handle login or signup)
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (type === "login"){
                handleLogin();
            } else {
                handleSignUp();
            }
        });

        // Add event listener to the anchor tag of the form (to switch modes)
        overlayDiv.querySelector("a").addEventListener("click", (e) => this.#openLoginSignUp(e));
    
        function createInputs(inputArr, parentElement) {
            for (const input of inputArr) {
                const element = parentElement.appendChild(Object.assign(document.createElement("input"), input));
                element.addEventListener("blur", () => element.classList.add("interacted"), { once: true}); // Prevent invalid border on initial state. Only allow invalid after at least 1 interaction
                if (input.name === "username"){
                    element.addEventListener("change", (e) => type === "login" ? validateLogin(e) : validateSignUpUsername(e));
                } else if (input.name === "password"){
                    element.addEventListener("change", (e) => type === "login" ? validateLogin(e) : validateSignUpPassword(e));
                } else if (input.name === "email") {
                    element.addEventListener("change", validateEmail);
                } else if (input.name === "confirmPassword") {
                    element.addEventListener("change", validateBothPasswords);
                }
            }
        }
    }
    
    /**
     * Creates the settings overlay
     */
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
            const optionValue = (this.#user.settings[setting.id]) ? " on" : "";
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
    
    /**
     * Creates the instructions overlay
     */
    #createInstructions() {
        e.preventDefault();
        const frag = new DocumentFragment();
        const divContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "instructions-container", classList: "div-menu-container" }));
    
        // Create h1 to inform user that these are the instructions
        divContainer.appendChild(Object.assign(document.createElement("h1"), { textContent: "How To Play" }));
    
        // Create p to explain how to play
        divContainer.appendChild(Object.assign(document.createElement("p"), { id: "instructions" }));
    
        overlayDiv.appendChild(frag);
    }

    /**
     * Sets up all overlay-related event listeners
     */
    #setUpEventListeners() {
        // Add event listener for showing settings
        settingsBtn.addEventListener("click", () => this.show("settings"));

        // Add event listener for showing instructions
        instructionsBtn.addEventListener("click", () => this.show("instructions"));

        // Add event listeners for login & signup
        navLoginSignUpDiv.addEventListener("click", (e) => this.#openLoginSignUp(e));

        // Add event listener for closing the overlay
        overlayDiv.addEventListener("click", (e) => this.#closeOverlay(e));
    }
    
    /**
     * Closes the overlay
     * @param {MouseEvent} e The MouseEvent that may close the overlay div
     */
    #closeOverlay(e) {
        if (e.target === e.currentTarget) {
            overlayDiv.classList.add("hidden");
            this.#clear()
        }
    }

    close() {
        overlayDiv.classList.add("hidden");
        this.#clear()
    }

    /**
     * Clears the overlay
     */
    #clear() {
        if (overlayDiv.firstElementChild) {
            overlayDiv.removeChild(overlayDiv.firstElementChild);
        }
    }
}