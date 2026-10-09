const fs = require("fs");
const path = require("path");

const ignoredDirectories = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next"
]);

const supportedExtensions = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx"
]);

function scanDirectory(directory) {

    const results = [];

    function walk(currentPath) {

        const entries = fs.readdirSync(
            currentPath,
            {
                withFileTypes: true
            }
        );

        for (const entry of entries) {

            const fullPath = path.join(
                currentPath,
                entry.name
            );

            if (entry.isDirectory()) {

                if (
                    ignoredDirectories.has(
                        entry.name
                    )
                ) {
                    continue;
                }

                walk(fullPath);

            } else {

                const extension =
                    path.extname(entry.name)
                        .toLowerCase();

                if (
                    supportedExtensions.has(
                        extension
                    )
                ) {
                    results.push(fullPath);
                }
            }
        }
    }

    walk(directory);

    return results;
}

module.exports = {
    scanDirectory
};