/* Some object outlines
 * installed = { installDate, rated, lastAsked, timesAsked }
 * activity = { numRecordings, alarmPlayed }
 * recordings = [ { uri, type, aspect_ratio } ]
 * EMERGENCY_NUMBER = { number, auto-generate (true/false) }
 * badges = { checkEmergencyServicesSettings }
 */ 

export const defaultInstalled = { installDate: Date.now(), rated: false, lastAsked: null, timesAsked: 0, version: 2 };
export const defaultActivity = { alarmPlayed: false };
export const defaultEmergencyNumber = { number: "911", auto_generate: true }
export const defaultBadges = { checkEmergencyServicesSettings: true }
export const defaultToClean = { cleanAsyncStorage: true }
// export const defaultNotifications = { checkSettings: "5/17" }
// export const alarmSettings = { autoRecord: true }

// Async Storage
export const INSTALLED_OLD_DO_NOT_USE = "installed";
export const INSTALLED = "installed_new";  // used to be installed but I added some new fields
export const ACTIVITY = "activity";
export const EMERGENCY_NUMBER = "EMERGENCY_NUMBER";
export const BADGES = "BADGES";
export const TO_CLEAN = "TO_CLEAN";
export const DATA = "data";
export const MIN_INSTALL_TIME = 5;
export const MIN_RATE_ASK_TIME = 7;

export const AUTO_GEN = "auto gen";
export const USER_GEN = "user gen";

export const HOME_STACK = "Home";
export const RECORDINGS_STACK = "Recordings";

export const LOADING = "Loading";
export const PLAYING = "Playing";
export const PAUSED = "Paused";
export const WAITING = "Waiting";
export const WAITING_CAMERA = "Waiting Camera";
export const RECORDINGS = "recordings";

export const ON = true;
export const OFF = true;

export const ACCEPT_RATING = "Accept Rating";
export const DECLINE_RATING = "Decline Rating";