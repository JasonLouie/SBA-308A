# SBA-308A - AniGuesser, an anime character guessing game

This is a one-page web application called Anime Guesser that prompts the user to guess a random main character based off of their photo. The anime's main characters are gathered through an additional API call based on the current anime the user is viewing. The user can navigate through all of the main characters for a particular anime and make guesses. Each anime character has its own guess-related stats, so guesses from one anime character will not carry over to the next. This enables the user to backtrack and view their previous results. The user can randomize the anime and character by pressing the randomize button. At the moment, there is no logic to handle the edge case of receiving the same exact anime or even the same exact anime character. The user can also choose to give up on guessing and reveal the name of the anime character. The application is responsive and indicates which characters the user gave up, haven't figured out, or solved when going through the images. Upon successfully guessing or giving up on guessing the anime character, the user can get info on the character and read about it. All anime-related data is retrieved from the [Jikan Anime API v4](https://docs.api.jikan.moe/).

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

The file `apicalls.js` handles making calls to the api using axios. There is a request and response interceptor used to log the time and duration for requests and responses. There are three different types of requests: `getAnimeList()`, `getAnimeCharacters(animeId)`, and `getAnimeCharacterFullInfo(characterId)`. These requests' id correspond to the MyAnimeList ids (referred to as mal_id in the data). The first request `getAnimeList()` only runs when the game starts. The anime-related info is stored in a private animeInfo object in `Game.js` and used to store most of the anime-related data from the API calls. This API call retrieves 25 TV anime with a minimum score of 8, ordered by favorites, sfw, and sorted in descending order. The API itself only allows a maximum of 25 anime to be retrieved at a time (any limit higher leads to an invalid call). At the moment, there isn't another API call to get more anime entries. This info is stored as the `info` key to the AnimeData entry of that particular animeId (the mal_id that references it). The second request `getAnimeCharacters(animeId)` retrieves all characters from a particular anime. The main characters are stored as the `mainChars` key to the AnimeData entry of that particular animeId. All characters are stored as the `allChars` key to the AnimeData entry matching a particular animeId. The third API call `getAnimeCharacterFullInfo(characterId)` is used to retrieve all info related to a specific anime character. This information is not stored and only used to populate the anime character info div in the overlay.

#### Functions

This file contains functions that are shared across modules and a couple of shared functions that could be in its own module, but haven't been separated yet. The functions that belong here are the event listeners for showing and hiding a description overlay (a tooltip for buttons and descriptions for settings). The event listeners `showDescription(e)` and `hideDescription(e)` perform their expected tasks by removing the `hidden` class and showing the `hidden` class, respectively. The rest of the functions, `getUsers()`, `getUser(username, password)`, `addUser(userObject)`, `propertyExists(property, value)`, and `clearUsers()`, are also used to access/modify the localStorage. These functions accomplish their expected tasks and are all used by `signup.js` and `login.js` (except for `clearUsers()`, which exists for testing purposes).

## Important Objects and the Game Class's Private Properties

This section contains a snippet of JDocs from the `Game.js` file. The types and private properties of the `Game` class will be mentioned throughout the Game Logic section.

```javascript
/**
 * Represents the object containing all information on an anime
 * @typedef {Object} AnimeData
 * @property {object} info - General info about the anime
 * @property {object[]} mainChars - An array of main characters
 * @property {object[]} allChars - An array of all characters
 */

/**
 * Represents the object containing the answers for all anime main characters
 * @typedef {Object} AnimeAnswer
 * @property {Set<string>[]} answers - The array of sets that contain acceptable answers. The array index corresponds directly to the index of the character in animeInfo[animeId].mainChars[index]
 * @property {string} display - The correct answer to display when the user gives up or guesses successfully
 */

// Private property animeInfo from the Game class
/**
* Store anime data in an object
* @type {Object.<number, AnimeData>}
*/
#animeInfo = {};

// Private property animeCharacterAnswers from the Game class
/**
* Store acceptable answers for each anime character in this obj. Each key corresponds to that anime's index in the array animeInfo[mal_id].mainChars.
* @type {Object.<number, AnimeAnswer}
*/
#animeCharacterAnswers = {};

/**
 * User instance
 * @type {User}
 */
#user;

/**
 * Slideshow instance
 * @type {Slideshow}
 */
#slideshow;

/**
 * Overlay instance
 * @type {Overlay}
 */
#overlay;

/**
 * Settings instance related to the user
 * @type {Settings}
 */
#settings;

/**
 * Game state; true for game started, false for game not started
 * @type {boolean}
*/
#gameStarted;
```

## Game Logic

This section explains how the game works and what happens behind the curtains from start to end. It will cover all the essential functions in `Game.js`, `Overlay.js`, `Settings.js`, `Slideshow.js`, and `User.js`. Make sure to read the previous section on important objects and properties before this section. The term animeId/anime id/mal_id all relate to the anime's particular id. The character index is the character's index in the array of main characters. The allChars object is not used yet, but will be used in future implementations to show popular supporting characters of an anime.

### Setting Up the Game

This anime character guessing game heavily relies on the `Game` class in `Game.js`. The file consists of various imports from other modules to handle api calls, shared methods, the slideshow, DOM selectors, and reference the overlay, settings, and user classes. The constructor for the Game class requires a user argument to bind the game to a particular user. To handle this, the `index.js` file declares an empty user with the default settings. The Game constructor also initializes the gameStarted property as false (since the game hasn't started yet), an instance for the slideshow, and instances for settings and overlay binded to the same user. The game has getters for the user and settings instance. The class also has a custom setter that is used to handle changing the user. This is only used in `login.js` and `signup.js` to change/update the user upon successfully logging in or signing up. The setter also updates the user for the overlay and settings instances. The login/sign up div is hidden and the logout/profile div is shown (this shows that the user is logged in).

### User Class

This section explains the main functionaity of the `User` class.

### Starting the Game

After initializing a user and game instance in `index.js`, the game can be started through the `startGame()` method. This method is async since it fetches 25 anime using the `getAnimeList()` method from `apicalls.js`. The method needs to block until the list of anime is received. After that, the method initializes the anime selector using the private `#initSelector()` method to iterate through the anime list. The method appends option elements with id and value corresponding to the anime's mal_id and the title of the anime as text content to a document fragment. The english is shown if the anime has one, otherwise it shows the title (which is sometimes the English-phonetic version of the Japanese title pertaining to the anime). creates the general structure for character answers, stores anime data. Once all options are added, the fragment is appended as a child element to the anime selector. Next, the private `#initGameData()` method is used to initialize/store game data by iterating through the anime list. It creates the general structure for each anime info entry as an AnimeData object and stores the anime's data in the key `info`. At the moment, the data is stored as is, but it should be filtered so that less memory is used. The other two keys, mainChars and allChars, are set to null. These keys will be updated in another private method, `#generateAnswers(animeId)`. The `#initGameData()` method also declares each key in `#animeCharacterAnswers` to the value of an empty array. The private `initUserData()` method iterates through each of the anime id keys in the anime info object to initialize the character guesses for each anime by calling the user's public method `initGuessesOfAnime(animeId)`.
initializing event listeners, and creating the general structure for the user's guesses. Next, the method sets up the event listeners on the webpage for static elements using the private method `#setUpEventListeners()`. More information on the event listeners in the next section. After that, the private method `#chooseAnime(animeId?)` which has an optional argument animeId is called. As of this moment, anytime this private method is called, no argument is passed, so the default argument is a random animeId chosen from the private method `#chooseRandomAnime()`. That private method accesses the keys of the `animeInfo` private object and returns a random key from it. This public method, `startGame()` can only run once (the `#gameStarted` private property is set to true after successfully running).

### Setting Up Event Listeners for Static HTMLElements

The private method `#setUpEventListeners()` adds event listeners to the game-related buttons and the anime selector. The randomizeButton, giveUpButton, and getInfoButton will each contain three event listeners: "click", "mouseover", and "mouseout". The last two events handle showing and hiding the button tooltip (`showDescription(e)` and `hideDescription(e)` respectively from `functions.js`). The randomizeButton's click event listener is binded to the game's private method `this.#chooseAnime()`. The giveUpButton's click event is binded to the game's private method `this.#handleGiveUp()` which handles the user giving up on guessing the character. The getInfoButton's click event is binded to the game's private method `this.#getCharacterInfo()` which handles showing the information of a particular anime character. The animeSelector's "change" event is binded to the the game's private method `this.#chooseAnime(e.target.value)`. The guessButton's "click" event is binded to the game's private method `this.#checkAnswers(e)`, which checks if the user's guess is correct. The signOutAnchor's "click" event is binded to the game's private method of `this.#signout()` which handles signing out.

### Choosing an Anime and Guess Validation

The private method `this.#chooseAnime()` handles choosing a random anime and a random main character from that anime. First, it disables all game related buttons (guess, randomize, giveup, and info) to prevent the user from doing anything else while the anime is being chosen. Next, it updates the selector to show which anime the character is from. After that, the game attempts to access the main characters from the animeInfo object. If it doesn't exist, it will make the API call to fetch all characters which will retrieve the info and store it. Once this part is complete, it checks if the user's anime character guesses object is initialized for that particular animeId and initializes it if needed. Then, the method will attempt to generate all acceptable answers with `this.#generateAnswers()` for the anime if the answers have not been generated yet. Answers are stored as lowercase because the guess should not be case sensitive. If nicknames are provided (some characters have nicknames, while others do not), the lowercase version of the nicknames are added to the set of acceptable answers. The two base cases for the anime character's name are "name the title" and "last name, first name". For the first case, only the original full name and the first name are acceptable. The last case allows inputting "first name last name", "first name, last name", "last name first name", and "lastname, firstname". Sometimes an anime character has a really long last name (middle names with last names), so these are treated as last names also. For names like "Middle Last, First" the "Last First" and "Last, First" entries will also be acceptable. The animeCharacterAnswers object is updated by pushing the object of answers: {the acceptable answer set of strings} and display: the answer as a string which should be displayed to the user when they correctly guess the character or gave up. After everything is complete, the 4 game buttons are enabled again. The event listener `#checkAnswer(e)` handles this by accessing the target's value (the target is always the input field) and checks if the user's guess is in the set of acceptable answers. If the user guess is empty, immediately return. The function increments the guess count if the answer is not an empty string and performs these checks. An alert is shown in the slideshow container that informs the user about their guess. If the guess is empty or wrong, an error message with a red background appears. If the answer is correct, an alert with a green background appears and the user's answer is stored in their respect object through `this.#user.store(animeId, formatted answer)`. The form is reset, the stats are updated, and all settings are reloaded to update the level of blur (depending on user settings) in relation to hints and blur.

### Anime Character Slideshow

The class Slideshow handles all functionality for the anime slide show. The class contains a private property `#currentPicIndex` which indicates the index of the current photo being shown. The constructor initializes the current slide index as 1 and sets up the event listener (using `#setUpEventListeners()`) for the static elements (next and prev) which are the anchor elements that handle viewing the next and previous photo. Initializing the index is not necessary in the context of the game (since its public method is used to create the slideshow, which by default sets this as 1 or the provided index). The class contains the private methods `#clear()`, which clears the slideshow container and dotNavigation container, `#hidePicsAndDots()`, which adds the hidden class to all dots and photos, `#showPic(num)`, which shows a particular picture at the given position, and `#buttonNavigate(num)`, which increments or decrements the currentPicIndex. The public method, `createSlideShow(animeInfo, index=1)`, handles most of the core logic. This function takes two parameters, animeInfo (the AnimeData object) and index (the index of the anime character that should be shown). The index parameter is optional (defaults to 1 if none is provided so that the first character of the anime is shown). Two fragments are created (one for the slideshow container and the other is for the dot navigation container) to append the respective elements to each fragment, then appending that fragment to the respective container. The slideshow container will have X anime img-containers (where X represents the number of main characters the anime has) and the dot naviagation container will have X dots. Each dot will have its own click event listener which handles showing that particular anime character when clicking on the dot. An anonymous event listener on the event "load" is added to each image to calculate the image's rendered height in relation to the animeSlideShow inner container (id of slideshow). If the image's height is smaller than the container's height, apply the center-img-vertically style which centers the image vertically. This is used to handle the edge cases of anime images being too short (the original aspect ratio has a height closer to its width than expected). After all this is complete, the function `#showPic(this.#currentPicIndex)` is called to show the current picture. This private method ensures that the currentPicIndex is within the range of 1 to X (X = number of anime characters), inclusively. Then, it hides all the pictures and removes the selected class from the dots (through `#hidePicsAndDots()`) and removes the hidden class from the index of the photo being shown (minus 1) and adds the selected css class to the respective dot of the same index (minus 1 also). Towards the end of the method, the gaveUp and solved css classes are removed from the answerDiv to reset the styling before showing the next photo. This prevents having both solved and gaveUp styling when the user correctly guesses or gives up, respectively. Lastly, it calls `game.updateStats()` to update the stats of the game (informs the game that the guess count and related data should be updated to reflect the particular anime character).

### Updating Stats and Game States

The public method from `Game.js`, `updateStats()`, is used to update the state of the game as well as the user's stats. It will update the guess counter, number of anime characters guessed / total anime characters for that anime, the input container, and the game buttons div based on the three states of the game. The three game states are guessing, guessed, and gave up. If the user is still guessing, the answerDiv and getInfoButton remain hidden while the giveUpButton remains visible. Otherwise, if the user gave up or guessed the character correctly, the answerDiv is shown. A character that was guessed has a green background, while a character that the user gave up on has a red background.

### Creating the Overlay

### Handling User Settings

### Logging In and Signing Up

### Data Persistence
