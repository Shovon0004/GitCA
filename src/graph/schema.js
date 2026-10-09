const driver = require("../config/neo4j");


async function createSchema() {

    const queries = [

        // Repository identity
        `
        CREATE CONSTRAINT repository_identity IF NOT EXISTS
        FOR (r:Repository)
        REQUIRE (r.owner, r.name) IS UNIQUE
        `,

        // File identity
        `
        CREATE CONSTRAINT file_identity IF NOT EXISTS
        FOR (f:File)
        REQUIRE (f.owner, f.repository, f.path) IS UNIQUE
        `,

        // Function identity
        `
        CREATE CONSTRAINT function_identity IF NOT EXISTS
        FOR (fn:Function)
        REQUIRE (
            fn.owner,
            fn.repository,
            fn.filePath,
            fn.name
        ) IS UNIQUE
        `,

        // Class identity
        `
        CREATE CONSTRAINT class_identity IF NOT EXISTS
        FOR (c:Class)
        REQUIRE (
            c.owner,
            c.repository,
            c.filePath,
            c.name
        ) IS UNIQUE
        `,

        // Commit identity
        `
        CREATE CONSTRAINT commit_identity IF NOT EXISTS
        FOR (c:Commit)
        REQUIRE c.hash IS UNIQUE
        `
    ];


    for (const query of queries) {

        await driver.executeQuery(query);

        console.log(
            "Schema created successfully."
        );
    }
}


module.exports = {
    createSchema
};