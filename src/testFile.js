const {
    createFile
} = require("./graph/file");

createFile(
    "facebook",
    "react",
    "src/React.js"
)
    .then(result => {
        console.log("File created:", result);
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });