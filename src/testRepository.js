const {
    createRepository
} = require("./graph/repository");

createRepository("facebook", "react")
    .then(result => {
        console.log("Repository created:", result);
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });