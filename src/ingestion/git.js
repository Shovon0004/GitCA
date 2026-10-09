const {
    execFileSync
} = require("child_process");
const fs = require("fs");
const path = require("path");


function isGitRepository(repositoryPath) {
    return fs.existsSync(
        path.join(repositoryPath, ".git")
    );
}


function runGit(
    repositoryPath,
    args
) {
    return execFileSync(
        "git",
        args,
        {
            cwd: repositoryPath,
            encoding: "utf8"
        }
    ).trim();
}


// Get repository commits
function getCommits(
    repositoryPath
) {
    if (!isGitRepository(repositoryPath)) {
        return [];
    }

    try {
        const output =
            runGit(
                repositoryPath,
                [
                    "log",
                    "--pretty=format:%H|%an|%ae|%ad|%s",
                    "--date=iso"
                ]
            );

        if (!output) {
            return [];
        }

        return output
            .split("\n")
            .map(line => {
                const [
                    hash,
                    author,
                    email,
                    date,
                    ...messageParts
                ] = line.split("|");

                return {
                    hash,
                    author,
                    email,
                    date,
                    message:
                        messageParts.join("|")
                };
            });
    } catch (error) {
        console.warn(
            `Could not read git commits from ${repositoryPath}:`,
            error.message
        );
        return [];
    }
}


// Get files changed by a commit
function getChangedFiles(
    repositoryPath,
    commitHash
) {
    if (!isGitRepository(repositoryPath)) {
        return [];
    }

    try {
        const output =
            runGit(
                repositoryPath,
                [
                    "diff-tree",
                    "--no-commit-id",
                    "--name-only",
                    "-r",
                    "--root",
                    commitHash
                ]
            );

        if (!output) {
            return [];
        }

        return output
            .split("\n")
            .filter(Boolean);
    } catch (error) {
        console.warn(
            `Could not get changed files for commit ${commitHash}:`,
            error.message
        );
        return [];
    }
}


module.exports = {
    isGitRepository,
    getCommits,
    getChangedFiles
};