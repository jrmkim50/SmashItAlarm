/* Some object outlines
 * installed = { installDate, rated, lastAsked, timesAsked }
 * activity = { numRecordings, alarmPlayed }
 * recordings = [ { uri, type, aspect_ratio } ]
 * 
 * 
 */ 

export const defaultInstalled = { installDate: Date.now(), rated: false, lastAsked: null, timesAsked: 0 };
export const defaultActivity = { numRecordings: 0, alarmPlayed: false };

// Async Storage
export const INSTALLED = "installed_new";  // used to be installed but I added some new fields
export const ACTIVITY = "activity";
export const MIN_INSTALL_TIME = 5;
export const MIN_RATE_ASK_TIME = 7;



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