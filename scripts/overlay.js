// Make a recursive function for creating elements given an array of objects
import overlayDict from "../constants/constants.js";
const overlayDiv = document.getElementById("overlay");
export { overlayDiv };

// Handle opening login or signup form
export function handleLoginSignUp(e) {
    if (e.target.localName === "a"){
        e.preventDefault();
        createOverlay(e.target.textContent.replace(" ", "").toLowerCase());
    }
}

// Handle opening instructions and settings overlay
export function handleOpenNavElement(e) {
    if (e.target.id === "settingsBtn"){
        e.preventDefault();
        createOverlay(e.target.id.slice(-3));
    }
}

// Creates the login or sign up form
function createForm(type) {
    clearOverlay();
    const frag = new DocumentFragment();
    const formContainer = frag.appendChild(Object.assign(document.createElement("div"), { id: "form-container" }));
    const form = formContainer.appendChild(Object.assign(document.createElement("form"), { id: `${type}-form` }));

    // Create h1 as a form type indicator
    form.appendChild(Object.assign(document.createElement("h1"), { textContent: `${overlayDict[type].buttonText} Form` }))

    // Create form mode indicator
    const formMode = form.appendChild(Object.assign(document.createElement("div"), { id: "form-mode" }));
    formMode.appendChild(Object.assign(document.createElement("p"), { classList: `form-type ${(type === "login") ? "selected" : "unselected"}` }));
    formMode.appendChild(Object.assign(document.createElement("p"), { classList: `form-type ${(type === "signup") ? "selected" : "unselected"}` }));

    // Create inputs
    createInputs(overlayDict[type].inputs, form);

    // Create the submit button and recommendation
    form.appendChild(Object.assign(document.createElement("button"), { type: "submit", id: "form-submit", textContent: `${overlayDict[type].buttonText}` }));
    form.appendChild(Object.assign(document.createElement("p"), { innerHTML: `${overlayDict[type].innerHTML}` }));
    overlayDiv.appendChild(frag);

    // Add event listener to the anchor tag of the form (to switch modes)
    overlayDiv.querySelector("a").addEventListener("click", handleLoginSignUp);

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

// Creates the instructions overlay

export function createOverlay(type) {
    console.log(`Created overlay ${type}`);
    overlayDiv.classList.remove("hidden");

    if (type === "login" || type === "signup") { // Login/signup form
        createForm(type);
    } else if (type === "settings") {

    } else if (type === "instructions") {

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