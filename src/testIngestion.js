const {
    ingestRepository
} = require("./ingestion/ingestRepository");


ingestRepository(
    "facebook",
    "react",
    "./test-repository"
)
    .then(result => {

        console.log(
            "\n=============================="
        );

        console.log(
            "Ingestion complete:"
        );

        console.log(
            result
        );

        console.log(
            "=============================="
        );

        process.exit(0);
    })
    .catch(error => {

        console.error(
            "\n=============================="
        );

        console.error(
            "Ingestion failed:"
        );

        console.error(
            error
        );

        console.error(
            "=============================="
        );

        process.exit(1);
    });