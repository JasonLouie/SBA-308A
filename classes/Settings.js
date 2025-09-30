import { animeSelector, animeSlideshowContainer as slideshow } from "../constants/selectors.js";
import { game } from "../scripts/index.js";
import User from "./User.js";

export default class Settings {
    #user;
    
    /**
     * 
     * @param {User} user User instance
     */
    constructor(user) {
        this.#user = user;
    }

    /**
     * @param {User} user
     */
    set user(user) {
        this.#user = user;
    }

    /**
     * 
     * @param {string} setting 
     */
    changeSetting(setting) {
        this.#user.toggleSetting(setting);
        game.saveUserData();
        const settingValue = this.#user.settings[setting];
        this.#handleSetting(setting, settingValue);
    }
    
    /**
     * Handles updating the game to reflect any changes to the settings
     * @param {string} setting - Type of setting
     * @param {boolean} settingValue - Setting value
     */
    #handleSetting(setting, settingValue) {
        switch (setting) {
            case "dark-mode":
                if (settingValue){
                    document.body.classList.add("dark-mode");
                } else {
                    document.body.classList.remove("dark-mode");
                }
                break;
            case "hints":
                if (settingValue){
                    // show hints (Maybe character spelling hints?)
                }
                this.updateBlur(); // Update intensity of blur (static: hints off or dynamic: hints on)
                break;
            case "blur":
                this.updateBlur();
                break;
            case "colors":
                const photos = slideshow.children;
                for (let i = 0; i < photos.length; i++) {
                    const gaveUp = this.#user.gaveUp(animeSelector.value, i);
                    const emptyAnswer = this.#user.guesses[animeSelector.value][i].userAnswer === null;
                    if (!settingValue && !gaveUp && emptyAnswer){
                        photos[i].classList.add("img-no-colors");
                    } else {
                        photos[i].classList.remove("img-no-colors");
                    }
                }
                break;
            default:
                break;
        }
    }

    /**
     * Updates the image blur with respect to the hint and blur setting
     */
    updateBlur() {
        const guessesObj = this.#user.guesses[animeSelector.value];
        const userSettings = this.#user.settings;
        const photos = slideshow.children;
        const blurDict = { 0: "blur-xl", 1: "blur-lg", 2: "blur-md", 3: "blur-sm", 4: "blur-xs" };
        
        for (let i = 0; i < photos.length; i++) {
            if (userSettings.blur && guessesObj[i].userAnswer === null && !guessesObj[i].gaveUp) {
                if (!userSettings.hints) { // Only use max blur if hints are off
                    removeBlurs(photos[i]);
                    photos[i].classList.add(blurDict[0]);
                } else {
                    // Remove older blurs
                    removeBlurs(photos[i], guessesObj[i].guessCount);
                    // Apply blur if it exists
                    if (blurDict[guessesObj[i].guessCount]){
                        photos[i].classList.add(blurDict[guessesObj[i].guessCount]);
                    }
                }
            } else {
                removeBlurs(photos[i]);
            }
        }
        
        /**
         * Removes blurs lower than the provided intensity or all blurs
         * @param {HTMLElement} target - The element that should no longer have blurs (up until the intensity listed)
         * @param {number} intensity - Intensity of blur
         */
        function removeBlurs(target, intensity=5) {
            for (let i = 0; i < intensity; i++) {
                target.classList.remove(blurDict[i]);
            }
        }
    }
    
    /**
     * Updates the webpage by loading through each setting (ensures settings are properly shown)
     */
    loadAllSettings() {
        const settings = this.#user.settings;
        for (const setting in settings){
            this.#handleSetting(setting, settings[setting]);
        }
    }
}