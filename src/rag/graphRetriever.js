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


module.exports = {
    searchFunctions,
    getFileGraphContext,
    getFileDependencies,
    getFunctionContext
};