let emergency_numbers = require("../assets/emergency_numbers.json");

// for (let country of emergency_numbers) {
//     if (!country.Police.All[0]) {
//         console.log(country.Country)
//     }
// }

let countryCode = "KR";
let numbers = emergency_numbers.find(country => country.Country.ISOCode === countryCode);
console.log(numbers.Police.All[0] ? numbers.Police.All[0] : "911");