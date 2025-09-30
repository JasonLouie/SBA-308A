# SBA-308A
This is a one-page web application called Anime Guesser that prompts the user to guess a random main character based off of their photo. The anime's main characters are gathered through an additional API call based on the current anime the user is viewing. The user can navigate through all of the main characters for a particular anime and make guesses. Each anime character has its own guess-related stats, so guesses from one anime character will not carry over to the next. This enables the user to backtrack and view their previous results. The user can randomize the anime and character by pressing the randomize button. At the moment, there is no logic to handle randomization leading the user to the same exact anime or even the same exact anime and character. The user can also choose to give up on guessing and reveal the name of the anime character. The application is responsive and indicates that the user gave up. Upon successfully guessing or giving up on guessing the anime character, the user can get info on the character and read about it. All anime-related data is retrieved from the [Jikan Anime API v4](https://docs.api.jikan.moe/). 

## Files
The project contains subdirectories of classes, constants, images, and scripts. Outside of the directory, it has a `styles.css` file, an `index.html` file, and this `README.md` file. The `index.html` file is very simple, but handles the core logic of the application. Without it, the game will not run at all.

### Classes Directory
In the classes folder, the `Game.js` file handles the game logic itself. It strictly contains a class, `Game`, which is used in `../scripts/index.js` to create one instance of the game. The `Overlay.js` file handles all logic related to the overlay. The `Settings.js` file handles all logic related to the game's settings. Both `Settings.js` and `Overlay.js` are used in `Game.js` to create one private instance of each in order for the game to function. The `User.js` file handles the logic for users that are playing the game (mostly used to store and access data related to the user). All of these classes are modules that have a default export of their respective class.

### Constants Directory
In the constants folder, the `constants.js` file contain important objects or arrays that must stay the same. Some of these constants are used to populate the overlays in `../classes/Overlay.js`, while other constants like `defaultSettings` are used as a constant to make a copy from. The `selectors.js` file contain all the selectors for static elements on the webpage. These selectors are referenced in most of the js files to prevent having to declare the selector each time.

### Images Directory
The images folder contains dark and light versions of the profile, results, and settings icons. These are used as background images so that the change in styling (from dark mode to light mode) changes these indirectly with Javascript (change in game settings).

### Scripts Directory
The scripts folder contains `apicalls.js`, `functions.js`, `index.js`, `login.js`, and `signup.js`. Explanations for the last three files can be found in the game logic section.

#### Making API Calls
The file `apicalls.js` handles making calls to the api using axios. There is a request and response interceptor used to log the time and duration for requests and responses. There are three different types of requests: `getAnimeList`, `getAnimeCharacters(animeId)`, and `getAnimeCharacterFullInfo(characterId)`. These requests' id correspond to the MyAnimeList ids (referred to as mal_id in the data). The first request `getAnimeList` only runs when the game starts. The anime-related info is stored in a private animeInfo object in `Game.js` and used to store most of the anime-related data from the API calls. This API call retrieves 25 TV anime with a minimum score of 8, ordered by favorites, sfw, and sorted in descending order. The API itself only allows a maximum of 25 anime to be retrieved at a time (any limit higher leads to an invalid call). At the moment, there isn't another API call to get more anime entries. This info is stored as the `info` key to the AnimeData entry of that particular animeId (the mal_id that references it). The second request `getAnimeCharacters(animeId)` retrieves all characters from a particular anime. The main characters are stored as the `mainChars` key to the AnimeData entry of that particular animeId. All characters are stored as the `allChars` key to the AnimeData entry matching a particular animeId. The third API call `getAnimeCharacterFullInfo(characterId)` is used to retrieve all info related to a specific anime character. This information is not stored and only used to populate the anime character info div in the overlay.

#### Functions
This file contains functions that are shared across modules and a couple of shared functions that could be in its own module, but haven't been separated yet. The functions that belong here are the event listeners for showing and hiding a description overlay (a tooltip for buttons and descriptions for settings). The event listeners `showDescription(e)` and `hideDescription(e)` perform their expected tasks by removing the `hidden` class and showing the `hidden` class, respectively. The rest of the functions, `getUsers()`, `getUser(username, password)`, `addUser(userObject)`, `propertyExists(property, value)`, and `clearUsers()`, are also used to access/modify the localStorage. These functions accomplish their expected tasks and are all used by `signup.js` and `login.js` (except for `clearUsers()`, which exists for testing purposes).

## Game Logic
This section explains how the game works and what happens behind the curtains from start to end. It will cover all the essential functions in `Game.js`, `Overlay.js`, `Settings.js`, `Slideshow.js`, and `User.js`.

### Setting Up the Game


### Starting the Game

### Choosing an Anime

### Anime Character Slideshow

### Answer Validation

### Game States

### Creating the Overlay

### Handling User Settings

### Logging In and Signing Up

### Data Persistence