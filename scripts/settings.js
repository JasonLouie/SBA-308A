import { user } from "../classes/User.js";
const animeSelector = document.getElementById("anime-selector"); // Used to get the animeId
const slideshow = document.getElementById("slideshow");

export function changeSetting(setting) {
    user.toggleSetting(setting);
    const settingValue = user.settings[setting];
    // console.log(`Changed ${setting} to ${settingValue}`);
    handleSetting(setting, settingValue);
}

function handleSetting(setting, settingValue) {
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
            updateBlur(); // Update intensity of blur (static: hints off or dynamic: hints on)
            break;
        case "blur":
            updateBlur();
            break;
        case "colors":
            const photos = slideshow.children;
            for (const photo of photos) {
                if (!settingValue){
                    photo.classList.add("img-no-colors");
                } else {
                    photo.classList.remove("img-no-colors");
                }
            }
            break;
        default:
            break;
    }
}

export function updateBlur() {
    const guessesObj = user.guesses[animeSelector.value];
    const userSettings = user.settings;
    const photos = slideshow.children;
    const blurDict = { 0: "blur-xl", 1: "blur-lg", 2: "blur-md", 3: "blur-sm", 4: "blur-xs" };
    
    for (let i = 0; i < photos.length; i++) {
        if (userSettings.blur && guessesObj[i].userAnswer === null) {
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
    
    function removeBlurs(target, intensity=5) {
        for (let i = 0; i < intensity; i++) {
            target.classList.remove(blurDict[i]);
        }
    }
}

export function loadAllSettings() {
    const settings = user.settings;
    for (const setting in settings){
        handleSetting(setting, settings[setting]);
    }
}