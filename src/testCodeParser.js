const {
    extractCodeEntities
} = require("./ingestion/codeParser");


const code = `
const authService = require("../services/authService");

function login() {
    authService.authenticate();
}

function logout() {
    console.log("Logout");
}
`;


const result =
    extractCodeEntities(code);


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);