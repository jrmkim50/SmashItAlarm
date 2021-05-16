import { TESTING } from "../config";
import { INSTALLED, ACTIVITY, defaultInstalled, MIN_RATE_ASK_TIME, defaultActivity } from "./constants";
import { elapsedToDays, getAsyncStorageItem, setAsyncStorageItem } from "./utils";

// Given an object of format installed (see constants.js), returns whether the data fits criteria to ask for a rating
const validateInstallation = (installed) => {
    let installElapsed = Date.now() - installed.installDate;
    if (installed.timesAsked == 0) {
        if (elapsedToDays(installElapsed) >= MIN_INSTALL_TIME) {
            return true;
        }
    } else {
        let lastAskedElapsed = Date.now() - installed.lastAsked;
        if (!installed.rated && elapsedToDays(lastAskedElapsed) >= MIN_RATE_ASK_TIME) {
            return true;
        }
    }
    return false;
}

// Given an object of format activity (see constants.js), returns whether the data fits criteria to ask for a rating
const validateActivity = (activity) => {
    if (activity.numRecordings > 0 && activity.alarmPlayed) {
        return true;
    }
    return false;
}

// Given an installed object and activity, returns whether those statuses warrant asking for rating
const checkActivity = (installed, activity) => {
    let installedStatus = validateInstallation(installed);
    let activityStatus = validateActivity(activity);
    return installedStatus && activityStatus;
}

// Returns true or false on whether to ask for a rating or not
export const analyzeInstalledData = async () => {
    try {
        let installed = await getAsyncStorageItem(INSTALLED);
        if (TESTING) {
            console.log(installed);
        }
        if (!installed) {
            setAsyncStorageItem(INSTALLED, defaultInstalled);
            return false;
        }
        let activity = await getAsyncStorageItem(ACTIVITY);
        if (!activity) {
            setAsyncStorageItem(ACTIVITY, defaultActivity);
            return false;
        }
        if (checkActivity(installed, activity)) {
            return true;
        }
        return false;
    } catch (err) {
        console.log(err.message);
        return false;
    }
}