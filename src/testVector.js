require("dotenv").config();

const {
    indexRepository
} = require("./vector/indexRepository");

const {
    searchSimilar
} = require("./vector/vectorStore");


async function main() {

    await indexRepository(
        "./test-repository"
    );


    const results =
        await searchSimilar(
            "Where is authentication implemented?",
            3
        );


    console.log(
        "\nVector Search Results:"
    );


    for (
        const result
        of results
    ) {

        console.log(
            "\nFile:",
            result.file
        );

        console.log(
            "Score:",
            result.score
        );
    }
}


main()
    .catch(error => {

        console.error(error);

        process.exit(1);
    });