const loginInputs = [
    { type: "text", name: "username", placeholder: "Username", className: "field", autocomplete: "username" },
    { type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "current-password" },
];
const loginButtonText = "Login";
const loginInnerHTML = `Don't have an account? <a href="#" class="signup">Sign Up</a>`;

const signUpInputs = [
    { type: "text", name: "username", placeholder: "Username", className: "field", autocomplete: "username" },
    { type: "email", name: "email", placeholder: "Email", className: "field", autocomplete: "email" },
    { type: "password", name: "password", placeholder: "Password", className: "field", autocomplete: "new-password" },
    { type: "password", name: "confirmPassword", placeholder: "Confirm password", className: "field" }
];
const signUpInnerHTML = `Already have an account? <a href="#" class="login">Login</a>`;
const signUpButtonText = "Sign Up";

const settings = [
    {id: "dark-mode", classList: "settings", textContent: "Dark Mode", isOn: true},
    {id: "game-mode", classList: "settings", textContent: "Game Mode", modes: ["Character", "Anime", "Manga"], choice: 0},
    {id: "hints", classList: "settings", textContent: "Show Hints", isOn: true, description: "Show hints after each wrong guess."},
    {id: "blur", classList: "settings", textContent: "Enable Blur", isOn: false, description: "Image is blurred and unblurs after each wrong guess if hints are enabled."},
    {id: "colors", classList: "settings", textContent: "Show Photo Colors", isOn: true}
]

const overlayDict = {
    login: { inputs: loginInputs, innerHTML: loginInnerHTML, buttonText: loginButtonText},
    signup: { inputs: signUpInputs, innerHTML: signUpInnerHTML, buttonText: signUpButtonText }
};

export default overlayDict;