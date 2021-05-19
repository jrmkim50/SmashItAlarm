import { defaultActivity, defaultInstalled, INSTALLED, INSTALLED_OLD_DO_NOT_USE, ACTIVITY, EMERGENCY_NUMBER, defaultEmergencyNumber, AUTO_GEN, USER_GEN, defaultBadges, BADGES } from '../app/utils/constants';
import { getAsyncStorageItem, setAsyncStorageItem } from '../app/utils/utils';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { analyzeInstalledData } from '../app/utils/analytics';

beforeEach(async () => {
    await AsyncStorage.clear()
})

test('Correctly analyzes installed data on FIRST load', async () => {
    let toAsk = await analyzeInstalledData();
    let installed = await getAsyncStorageItem(INSTALLED);
    let activity = await getAsyncStorageItem(ACTIVITY);
    expect(toAsk).toEqual(false);
    delete installed.installDate;
    delete defaultInstalled.installDate;
    expect(installed).toEqual(defaultInstalled);
    expect(activity).toEqual(defaultActivity);
})

test('Correctly analyzes installed data after update (we migrated to new installed data)', async () => {
    await setAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE, { installDate: Date.now() - 1000000, asked: false })
    let oldInstalled = await getAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE);
    let toAsk = await analyzeInstalledData();
    let installed = await getAsyncStorageItem(INSTALLED);
    let activity = await getAsyncStorageItem(ACTIVITY);
    expect(toAsk).toEqual(false);
    let expectedInstalled = defaultInstalled;
    expectedInstalled.installDate = oldInstalled.installDate;
    expect(installed).toEqual(expectedInstalled);
    expect(activity).toEqual(defaultActivity);
})

test('Correctly asks for rating after update (we migrated to new installed data)', async () => {
    await setAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE, { installDate: Date.now() - 432000000, asked: false })
    let oldInstalled = await getAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE);
    let toAsk = await analyzeInstalledData();
    let installed = await getAsyncStorageItem(INSTALLED);
    let activity = await getAsyncStorageItem(ACTIVITY);
    expect(toAsk).toEqual(false);
    let expectedInstalled = defaultInstalled;
    expectedInstalled.installDate = oldInstalled.installDate;
    expect(installed).toEqual(expectedInstalled);
    expect(activity).toEqual(defaultActivity);
    let defaultInstalledCopy = {...defaultInstalled}
    delete defaultInstalledCopy.installDate
    expect(defaultInstalledCopy).toEqual({ rated: false, lastAsked: null, timesAsked: 0, version: 2 })

    await setAsyncStorageItem(ACTIVITY, { numRecordings: 1, alarmPlayed: true })
    toAsk = await analyzeInstalledData();
    expect(toAsk).toEqual(true);
    expect(defaultActivity).toEqual({ numRecordings: 0, alarmPlayed: false })
})

test('Correctly does NOT ask for rating after update', async () => {
    await setAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE, { installDate: Date.now() - 432000000, asked: true })
    await setAsyncStorageItem(ACTIVITY, { numRecordings: 1, alarmPlayed: true })
    let oldInstalled = await getAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE);
    let toAsk = await analyzeInstalledData();
    let installed = await getAsyncStorageItem(INSTALLED);
    let activity = await getAsyncStorageItem(ACTIVITY);
    expect(toAsk).toEqual(false);
    let expectedInstalled = defaultInstalled;
    expectedInstalled.installDate = oldInstalled.installDate;
    expectedInstalled.rated = true;
    expect(installed).toEqual(expectedInstalled);
    expect(activity).toEqual({ numRecordings: 1, alarmPlayed: true });
})

let code = "US"

const getPhoneNumber = async () => {
    let emergency_numbers = require("../app/assets/emergency_numbers.json");
    let countryCode = code
    let numbers = emergency_numbers.find(country => country.Country.ISOCode === countryCode);
    return numbers.Police.All[0] ? numbers.Police.All[0] : "911";
}

const getSavedPhoneNumber = async () => {
    let savedNumberData = await getAsyncStorageItem(EMERGENCY_NUMBER);
    return savedNumberData;
}

// Given an emergency numbers, this function will save that number.
// If this process was started automatically, the number only saves if the savedNumberData's auto generate
// feature is on and if it is a new number. If this process was started manually, the auto generate feature will 
// turn off in the future and we will save the new number
const savePhoneNumber = async (number, entity) => {
    let numberData = {...defaultEmergencyNumber};
    numberData.number = number;

    let savedNumberData = await getSavedPhoneNumber();
    if (!savedNumberData) {
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
        return;
    }
    if (entity === AUTO_GEN && savedNumberData.auto_generate && numberData.number !== savedNumberData.number) {
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
    }
    if (entity === USER_GEN) {
        numberData.auto_generate = false;
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
    }
}

const saveNumberData = async (data) => {
    await setAsyncStorageItem(EMERGENCY_NUMBER, data);
}

test("Properly saves phone number on first load", async () => {
    let number = await getPhoneNumber();
    await savePhoneNumber(number, AUTO_GEN);
    let saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "911", auto_generate: true })
})

test("Properly saves phone number on region change", async () => {
    let number = await getPhoneNumber();
    await savePhoneNumber(number, AUTO_GEN);
    let saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "911", auto_generate: true })
    code = "KR";
    number = await getPhoneNumber();
    await savePhoneNumber(number, AUTO_GEN);
    saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "112", auto_generate: true })
})

test("Properly saves phone number on change between manual and auto", async () => {
    code = "US"
    let number = await getPhoneNumber();
    await savePhoneNumber(number, AUTO_GEN);
    let saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "911", auto_generate: true })
    
    await savePhoneNumber("917324", USER_GEN);
    saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "917324", auto_generate: false })
    
    await savePhoneNumber("9174", USER_GEN);
    saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "9174", auto_generate: false })

    code = "KR";
    number = await getPhoneNumber();
    await savePhoneNumber(number, AUTO_GEN);
    saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "9174", auto_generate: false })

    await setAsyncStorageItem(EMERGENCY_NUMBER, { number: "9174", auto_generate: true })
    code = "KR";
    number = await getPhoneNumber();
    await savePhoneNumber(number, AUTO_GEN);
    saved = await getSavedPhoneNumber()
    expect(saved).toEqual({ number: "112", auto_generate: true })
})

test("Settings screen shows badge on load", async () => {
    let badges = await getAsyncStorageItem(BADGES)
    badges = badges ? badges : {...defaultBadges};
    expect(badges.checkEmergencyServicesSettings)
    await setAsyncStorageItem(BADGES, badges);
    badges = await getAsyncStorageItem(BADGES)
    expect(badges).toEqual({ checkEmergencyServicesSettings: true })
    expect(defaultBadges).toEqual({ checkEmergencyServicesSettings: true })
})

test("Settings screen shows no badge on load", async () => {
    await setAsyncStorageItem(BADGES, { checkEmergencyServicesSettings: false });
    let badges = await getAsyncStorageItem(BADGES)
    expect(!badges.checkEmergencyServicesSettings)
})