const fs = require("fs");
const path = require("path");

const {
    scanDirectory
} = require("../ingestion/fileScanner");

const {
    addDocument
} = require("./vectorStore");


async function indexRepository(
    repositoryPath
) {

    const files =
        scanDirectory(
            repositoryPath
        );


    for (
        const file
        of files
    ) {

        const content =
            fs.readFileSync(
                file,
                "utf8"
            );


        const relativePath =
            path.relative(
                repositoryPath,
                file
            );


        console.log(
            "Indexing:",
            relativePath
        );


        await addDocument({

            file:
                relativePath,

            text:
                content
        });
    }


    console.log(
        `Indexed ${files.length} files.`
    );
}


module.exports = {
    indexRepository
};