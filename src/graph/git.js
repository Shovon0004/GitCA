const driver = require("../config/neo4j");


async function createCommit(
    owner,
    repo,
    commit
) {

    await driver.executeQuery(
        `
        MATCH (r:Repository {
            owner: $owner,
            name: $repo
        })

        MERGE (c:Commit {
            hash: $hash
        })

        SET
            c.owner = $owner,
            c.repository = $repo,
            c.author = $author,
            c.email = $email,
            c.date = $date,
            c.message = $message

        MERGE (r)-[:HAS_COMMIT]->(c)
        `,
        {
            owner,
            repo,
            hash: commit.hash,
            author: commit.author,
            email: commit.email,
            date: commit.date,
            message: commit.message
        }
    );
}


async function connectCommitToFile(
    commitHash,
    owner,
    repo,
    filePath
) {

    await driver.executeQuery(
        `
        MATCH (c:Commit {
            hash: $commitHash
        })

        MATCH (f:File {
            owner: $owner,
            repository: $repo,
            path: $filePath
        })

        MERGE (c)-[:MODIFIES]->(f)
        `,
        {
            commitHash,
            owner,
            repo,
            filePath
        }
    );
}


module.exports = {
    createCommit,
    connectCommitToFile
};