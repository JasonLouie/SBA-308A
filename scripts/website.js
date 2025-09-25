// Update website based on api calls or user interaction
import {getAnimeList, getAnimeCharacters} from "./apicalls.js";
import {handleLoginSignUp} from "./overlay.js";

const loginAnchor = document.getElementById("loginNav");
const signupAnchor = document.getElementById("signupNav");
const animePic = document.getElementById("anime-pic");

loginAnchor.addEventListener("click", handleLoginSignUp);
signupAnchor.addEventListener("click", handleLoginSignUp);

const animeButton = document.getElementById("anime");
animeButton.addEventListener("click", async () => {
    const result = await getAnimeList();

    const randomAnime = chooseRandomAnime();
    console.log(randomAnime);

    animePic.src = randomAnime.images.jpg.image_url;

    const characters = getAnimeCharacters(randomAnime.mal_id);
    console.log(characters);
    

    function chooseRandomAnime() {
        const index = Math.floor(Math.random() * result.data.length);
        return result.data[index];
    }
});

// What do I show? A picture of an anime character from a random anime.
// Retrieve the character from the result of characters after passing anime id in get req
// Get photos related to character id and show more hints using some data from the API