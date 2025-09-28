// Main file
import Game from "../classes/Game.js";
import User from "../classes/User.js"

const user = new User("Guest", "no-email@fake.com", "none");
export const userSettings = user.settings;
export const userGuesses = user.characterGuesses;
export const game = new Game(user);

async function initLoad() {
    game.startGame();
}

initLoad();