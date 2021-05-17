let emergency_numbers = require("../assets/emergency_numbers.json");

for (let country of emergency_numbers) {
    if (!country.Police.All[0]) {
        console.log(country.Country)
    }
}