const loginInputs = [
    { type: "text", name: "username", placeholder: "Username", className: "field", autocomplete: "off", required: true },
    { type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "off", required: true },
];
const loginButtonText = "Login";
const loginInnerHTML = `Don't have an account? <a href="#" class="signup">Sign Up</a>`;

const signUpInputs = [
    { type: "text", name: "username", placeholder: "Username", className: "field", autocomplete: "off", required: true, minLength: 6 },
    { type: "email", name: "email", placeholder: "Email", className: "field", autocomplete: "off", required: true },
    { type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "off", required: true, minLength: 10 },
    { type: "password", name: "confirmPassword", placeholder: "Confirm password", className: "field", autocomplete: "off", required: true }
];
const signUpInnerHTML = `Already have an account? <a href="#" class="login">Login</a>`;
const signUpButtonText = "Sign Up";

const settings = [
    { id: "dark-mode", classList: "settings", textContent: "Dark Mode", isOn: true, description: "Toggle between Dark and Light Mode" },
    { id: "hints", classList: "settings", textContent: "Show Hints", isOn: true, description: "Show hints after each wrong guess" },
    { id: "blur", classList: "settings", textContent: "Enable Image Blur", isOn: false, description: "Image is blurred and slightly unblurs after each guess if hints are on" },
    { id: "colors", classList: "settings", textContent: "Show Photo Colors", isOn: true, description: "Toggle between showing black and white or regular photo colors" }
];

const instructions = [
    { id: "" },
    { id: "" }
];

export const defaultSettings = {"dark-mode": true, "hints": true, "blur": false, "colors": true};

const overlayDict = {
    login: { inputs: loginInputs, innerHTML: loginInnerHTML, buttonText: loginButtonText },
    signup: { inputs: signUpInputs, innerHTML: signUpInnerHTML, buttonText: signUpButtonText },
    settings: settings,
    instructions: instructions
};

export default overlayDict;