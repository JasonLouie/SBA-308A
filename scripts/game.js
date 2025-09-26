// Update website based on game logic
import { getAnimeList, getAnimeCharacters } from "./apicalls.js";

const animePic = document.getElementById("anime-pic");

export async function startGame() {
    const animeList = await getAnimeList();

    // const randomAnime = chooseRandomAnime();
    const randomAnime = animeList.data[9];
    console.log(randomAnime);

    // animePic.src = randomAnime.images.jpg.image_url;

    const characters = await getAnimeCharacters(randomAnime.mal_id);
    console.log(characters);

    const mainCharacters = characters.data.filter(entry => entry.role === "Main");
    console.log("List of main characters:\n", mainCharacters);

    animePic.src = chooseRandomCharacter(mainCharacters).character.images.jpg.image_url;

    function chooseRandomCharacter() {
        const index = Math.floor(Math.random() * mainCharacters.length);
        return mainCharacters[index];
    }

    function chooseRandomAnime() {
        const index = Math.floor(Math.random() * animeList.data.length);
        return animeList.data[index];
    }
};

// What do I show? A picture of an anime character from a random anime.
// Retrieve the character from the result of characters after passing anime id in get req
// Get photos related to character id and show more hints using some data from the API