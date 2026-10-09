const driver = require("../config/neo4j");

async function createFile(owner, repo, path) {

    const result = await driver.executeQuery(
        `
        MATCH (r:Repository {
            owner: $owner,
            name: $repo
        })

        MERGE (f:File {
            owner: $owner,
            repository: $repo,
            path: $path
        })

        MERGE (r)-[:CONTAINS]->(f)

        RETURN f
        `,
        {
            owner,
            repo,
            path
        }
    );

    return result.records[0].get("f").properties;
}

module.exports = {
    createFile
};