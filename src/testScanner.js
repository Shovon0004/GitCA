const {
    scanDirectory
} = require("./ingestion/fileScanner");

const files = scanDirectory(
    "./test-repository"
);

console.log("Files found:");

for (const file of files) {
    console.log(file);
}