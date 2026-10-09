const fs = require("fs");
const path = require("path");

const {
    scanDirectory
} = require("./fileScanner");

const {
    createRepository
} = require("../graph/repository");

const {
    createFile
} = require("../graph/file");

const {
    extractCodeEntities
} = require("./codeParser");

const {
    resolveImport
} = require("./importResolver");

const {
    createFunction,
    createClass,
    createImport,
    createCall
} = require("../graph/code");

const {
    createCommit,
    connectCommitToFile
} = require("../graph/git");

const {
    getCommits,
    getChangedFiles
} = require("./git");


async function ingestRepository(
    owner,
    repo,
    localPath
) {

    console.log("Creating repository...");

    await createRepository(
        owner,
        repo
    );


    console.log("Scanning files...");

    const files =
        scanDirectory(localPath);

    console.log(
        `Found ${files.length} source files.`
    );


    for (const file of files) {

        const relativePath =
            path.relative(
                localPath,
                file
            );


        const content =
            fs.readFileSync(
                file,
                "utf8"
            );


        console.log(
            "\nAdding file:",
            relativePath
        );


        // Create File
        await createFile(
            owner,
            repo,
            relativePath
        );


        // Parse code
        const entities =
            extractCodeEntities(
                content
            );


        console.log(
            "Functions:",
            entities.functions
        );

        console.log(
            "Classes:",
            entities.classes
        );

        console.log(
            "Imports:",
            entities.imports
        );

        console.log(
            "Calls:",
            entities.calls
        );


        // Create Functions
        for (
            const functionData
            of entities.functions
        ) {

            await createFunction(
                owner,
                repo,
                relativePath,
                functionData.name,
                functionData.type,
                functionData.startLine,
                functionData.endLine
            );
        }


        // Create Classes
        for (
            const classData
            of entities.classes
        ) {

            await createClass(
                owner,
                repo,
                relativePath,
                classData.name
            );
        }


        // Create IMPORTS
        for (
            const importPath
            of entities.imports
        ) {

            const resolvedPath =
                resolveImport(
                    file,
                    importPath
                );


            if (!resolvedPath) {

                console.log(
                    "Could not resolve import:",
                    importPath
                );

                continue;
            }


            const targetRelativePath =
                path.relative(
                    localPath,
                    resolvedPath
                );


            console.log(
                "Import:",
                relativePath,
                "→",
                targetRelativePath
            );


            await createImport(
                owner,
                repo,
                relativePath,
                targetRelativePath
            );
        }


        // Create CALLS
        for (
            const call
            of entities.calls
        ) {

            console.log(
                "Call:",
                call.caller,
                "→",
                call.callee
            );


            await createCall(
                owner,
                repo,
                relativePath,
                call.caller,
                call.callee
            );
        }
    }


    // --------------------------------
    // INGEST GIT COMMITS
    // --------------------------------
    console.log("\nIngesting git commits...");

    const commits = getCommits(localPath);
    console.log(`Found ${commits.length} commits.`);

    for (const commit of commits) {
        await createCommit(
            owner,
            repo,
            commit
        );

        const changedFiles = getChangedFiles(
            localPath,
            commit.hash
        );

        for (const filePath of changedFiles) {
            await connectCommitToFile(
                commit.hash,
                owner,
                repo,
                filePath
            );
        }
    }


    return {
        owner,
        repo,
        filesFound: files.length,
        commitsFound: commits.length
    };
}


module.exports = {
    ingestRepository
};