const fs = require("fs");
const path = require("path");


function resolveImport(
    currentFile,
    importPath
) {

    const currentDirectory =
        path.dirname(currentFile);


    const absolutePath =
        path.resolve(
            currentDirectory,
            importPath
        );


    const possiblePaths = [
        absolutePath,
        `${absolutePath}.js`,
        `${absolutePath}.jsx`,
        `${absolutePath}.ts`,
        `${absolutePath}.tsx`,
        path.join(
            absolutePath,
            "index.js"
        )
    ];


    for (
        const possiblePath
        of possiblePaths
    ) {

        if (
            fs.existsSync(
                possiblePath
            )
        ) {

            return possiblePath;
        }
    }


    return null;
}


module.exports = {
    resolveImport
};