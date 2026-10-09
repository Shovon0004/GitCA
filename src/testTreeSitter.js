const {
    parseJavaScript
} = require("./ingestion/treeSitter");

const code = `
function login() {
    console.log("Login");
}

function logout() {
    console.log("Logout");
}
`;

const tree = parseJavaScript(code);

console.log(tree.rootNode.toString());