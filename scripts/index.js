// Main file
import Game from "../classes/Game.js";
import User from "../classes/User.js";

const user = new User();
export const game = new Game(user);

async function initLoad() {
    await game.startGame();
}

initLoad();