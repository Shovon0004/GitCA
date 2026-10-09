const fs = require("fs");
const path = require("path");

const {
    scanDirectory
} = require("../ingestion/fileScanner");

const {
    addDocument
} = require("./vectorStore");


async function indexRepository(
    ownerOrPath,
    repo,
    repositoryPath
) {
    let owner = null;
    let actualRepo = null;
    let targetPath = ownerOrPath;

    if (repositoryPath !== undefined) {
        owner = ownerOrPath;
        actualRepo = repo;
        targetPath = repositoryPath;
    }

    const files =
        scanDirectory(
            targetPath
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
                targetPath,
                file
            );


        console.log(
            "Indexing:",
            relativePath
        );


        await addDocument({
            owner,
            repo: actualRepo,
            file:
                relativePath,

            text:
                content
        });
    }


    console.log(
        `Indexed ${files.length} files.`
    );

    return {
        indexedFiles: files.length
    };
}


module.exports = {
    indexRepository
};