const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");

const parser = new Parser();

parser.setLanguage(JavaScript);

function parseJavaScript(code) {

    const tree = parser.parse(code);

    return tree;
}

module.exports = {
    parseJavaScript
};