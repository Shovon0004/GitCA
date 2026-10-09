const driver = require("../config/neo4j");


// Search functions by name, file path or repository
async function searchFunctions(
    owner,
    repo,
    keyword
) {

    const result =
        await driver.executeQuery(
            `
            MATCH (f:File)-[:CONTAINS]->(fn:Function)

            WHERE
                f.owner = $owner
                AND f.repository = $repo
                AND (
                    toLower(fn.name) CONTAINS toLower($keyword)
                    OR toLower(f.path) CONTAINS toLower($keyword)
                )

            OPTIONAL MATCH
                (fn)-[:CALLS]->(called:Function)

            RETURN
                f.path AS file,
                fn.name AS function,
                fn.type AS type,
                fn.startLine AS startLine,
                fn.endLine AS endLine,
                collect(DISTINCT called.name) AS calls

            LIMIT 20
            `,
            {
                owner,
                repo,
                keyword
            }
        );


    return result.records.map(
        record => ({

            file:
                record.get("file"),

            function:
                record.get("function"),

            type:
                record.get("type"),

            startLine:
                record.get("startLine"),

            endLine:
                record.get("endLine"),

            calls:
                record.get("calls")
        })
    );
}


// Get complete graph information for a file
async function getFileGraphContext(
    owner,
    repo,
    filePath
) {

    const result =
        await driver.executeQuery(
            `
            MATCH (f:File {
                owner: $owner,
                repository: $repo,
                path: $filePath
            })

            OPTIONAL MATCH
                (f)-[:CONTAINS]->(fn:Function)

            OPTIONAL MATCH
                (f)-[:IMPORTS]->(imported:File)

            OPTIONAL MATCH
                (importer:File)-[:IMPORTS]->(f)

            OPTIONAL MATCH
                (fn)-[:CALLS]->(callee:Function)

            OPTIONAL MATCH
                (caller:Function)-[:CALLS]->(fn)

            RETURN
                f.path AS file,

                collect(DISTINCT {
                    name: fn.name,
                    type: fn.type,
                    startLine: fn.startLine,
                    endLine: fn.endLine,
                    calls: callee.name,
                    calledBy: caller.name
                }) AS functions,

                collect(DISTINCT imported.path)
                    AS imports,

                collect(DISTINCT importer.path)
                    AS importedBy
            `,
            {
                owner,
                repo,
                filePath
            }
        );


    if (result.records.length === 0) {
        return null;
    }


    const record =
        result.records[0];


    return {

        file:
            record.get("file"),

        functions:
            record.get("functions"),

        imports:
            record.get("imports"),

        importedBy:
            record.get("importedBy")
    };
}


async function getFileDependencies(
    owner,
    repo,
    filePath
) {

    const result =
        await driver.executeQuery(
            `
            MATCH (f:File {
                owner: $owner,
                repository: $repo,
                path: $filePath
            })

            OPTIONAL MATCH
                (f)-[:IMPORTS]->(imported:File)

            OPTIONAL MATCH
                (importer:File)-[:IMPORTS]->(f)

            RETURN
                f.path AS file,
                collect(DISTINCT imported.path)
                    AS imports,
                collect(DISTINCT importer.path)
                    AS importedBy
            `,
            {
                owner,
                repo,
                filePath
            }
        );


    if (result.records.length === 0) {
        return null;
    }


    const record =
        result.records[0];


    return {

        file:
            record.get("file"),

        imports:
            record.get("imports"),

        importedBy:
            record.get("importedBy")
    };
}


async function getFunctionContext(
    owner,
    repo,
    functionName
) {

    const result =
        await driver.executeQuery(
            `
            MATCH (f:File)-[:CONTAINS]->(fn:Function)

            WHERE
                f.owner = $owner
                AND f.repository = $repo
                AND fn.name = $functionName

            OPTIONAL MATCH
                (fn)-[:CALLS]->(callee:Function)

            OPTIONAL MATCH
                (caller:Function)-[:CALLS]->(fn)

            RETURN
                f.path AS file,
                fn.name AS function,
                fn.type AS type,
                fn.startLine AS startLine,
                fn.endLine AS endLine,
                collect(DISTINCT callee.name)
                    AS calls,
                collect(DISTINCT caller.name)
                    AS calledBy
            `,
            {
                owner,
                repo,
                functionName
            }
        );


    return result.records.map(
        record => ({

            file:
                record.get("file"),

            function:
                record.get("function"),

            type:
                record.get("type"),

            startLine:
                record.get("startLine"),

            endLine:
                record.get("endLine"),

            calls:
                record.get("calls"),

            calledBy:
                record.get("calledBy")
        })
    );
}


// Get contributors and their commit contributions
async function getContributors(owner, repo) {
    const result = await driver.executeQuery(
        `
        MATCH (r:Repository {owner: $owner, name: $repo})-[:HAS_COMMIT]->(c:Commit)
        RETURN
            c.author AS author,
            c.email AS email,
            count(c) AS commitsCount,
            collect(DISTINCT c.message)[0..5] AS sampleCommitMessages
        ORDER BY commitsCount DESC
        `,
        { owner, repo }
    );

    return result.records.map(r => ({
        author: r.get("author"),
        email: r.get("email"),
        commitsCount: r.get("commitsCount").toNumber ? r.get("commitsCount").toNumber() : Number(r.get("commitsCount")),
        sampleCommitMessages: r.get("sampleCommitMessages")
    }));
}


// Get most frequently changed files
async function getMostChangedFiles(owner, repo, limit = 10) {
    const result = await driver.executeQuery(
        `
        MATCH (r:Repository {owner: $owner, name: $repo})-[:HAS_COMMIT]->(c:Commit)-[:MODIFIES]->(f:File)
        RETURN
            f.path AS file,
            count(c) AS changeCount,
            collect(DISTINCT c.author) AS contributors
        ORDER BY changeCount DESC
        LIMIT 20
        `,
        { owner, repo }
    );

    return result.records.slice(0, limit).map(r => ({
        file: r.get("file"),
        changeCount: r.get("changeCount").toNumber ? r.get("changeCount").toNumber() : Number(r.get("changeCount")),
        contributors: r.get("contributors")
    }));
}


// Get recent commits history
async function getRecentCommits(owner, repo, limit = 15) {
    const result = await driver.executeQuery(
        `
        MATCH (r:Repository {owner: $owner, name: $repo})-[:HAS_COMMIT]->(c:Commit)
        OPTIONAL MATCH (c)-[:MODIFIES]->(f:File)
        RETURN
            c.hash AS hash,
            c.author AS author,
            c.date AS date,
            c.message AS message,
            collect(DISTINCT f.path) AS modifiedFiles
        ORDER BY c.date DESC
        LIMIT 30
        `,
        { owner, repo }
    );

    return result.records.slice(0, limit).map(r => ({
        hash: r.get("hash"),
        author: r.get("author"),
        date: r.get("date"),
        message: r.get("message"),
        modifiedFiles: r.get("modifiedFiles")
    }));
}


// Get repository high-level summary overview
async function getRepoOverview(owner, repo) {
    const result = await driver.executeQuery(
        `
        MATCH (r:Repository {owner: $owner, name: $repo})
        OPTIONAL MATCH (r)-[:CONTAINS]->(f:File)
        OPTIONAL MATCH (f)-[:CONTAINS]->(fn:Function)
        OPTIONAL MATCH (r)-[:HAS_COMMIT]->(c:Commit)
        RETURN
            r.owner AS owner,
            r.name AS repo,
            count(DISTINCT f) AS totalFiles,
            count(DISTINCT fn) AS totalFunctions,
            count(DISTINCT c) AS totalCommits,
            collect(DISTINCT c.author) AS contributors
        `,
        { owner, repo }
    );

    if (result.records.length === 0) return null;
    const r = result.records[0];
    return {
        owner: r.get("owner"),
        repo: r.get("repo"),
        totalFiles: r.get("totalFiles").toNumber ? r.get("totalFiles").toNumber() : Number(r.get("totalFiles")),
        totalFunctions: r.get("totalFunctions").toNumber ? r.get("totalFunctions").toNumber() : Number(r.get("totalFunctions")),
        totalCommits: r.get("totalCommits").toNumber ? r.get("totalCommits").toNumber() : Number(r.get("totalCommits")),
        contributors: r.get("contributors")
    };
}


module.exports = {
    searchFunctions,
    getFileGraphContext,
    getFileDependencies,
    getFunctionContext,
    getContributors,
    getMostChangedFiles,
    getRecentCommits,
    getRepoOverview
};