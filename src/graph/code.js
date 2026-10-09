const driver = require("../config/neo4j");


// ==========================================
// CREATE FUNCTION
// ==========================================

async function createFunction(
    owner,
    repo,
    filePath,
    functionName,
    functionType,
    startLine,
    endLine
) {
    if (!functionName) return null;

    const result =
        await driver.executeQuery(
            `
            MERGE (f:File {
                owner: $owner,
                repository: $repo,
                path: $path
            })

            MERGE (fn:Function {
                owner: $owner,
                repository: $repo,
                filePath: $path,
                name: $functionName
            })

            SET
                fn.type = $functionType,
                fn.startLine = $startLine,
                fn.endLine = $endLine

            MERGE (f)-[:CONTAINS]->(fn)

            RETURN fn
            `,
            {
                owner,
                repo,
                path: filePath,
                functionName,
                functionType,
                startLine,
                endLine
            }
        );


    if (result.records.length === 0) {
        return null;
    }

    return result.records[0]
        .get("fn")
        .properties;
}


// ==========================================
// CREATE CLASS
// ==========================================

async function createClass(
    owner,
    repo,
    filePath,
    className
) {
    if (!className) return null;

    const result =
        await driver.executeQuery(
            `
            MERGE (f:File {
                owner: $owner,
                repository: $repo,
                path: $path
            })

            MERGE (c:Class {
                owner: $owner,
                repository: $repo,
                filePath: $path,
                name: $className
            })

            MERGE (f)-[:CONTAINS]->(c)

            RETURN c
            `,
            {
                owner,
                repo,
                path: filePath,
                className
            }
        );


    if (result.records.length === 0) {
        return null;
    }

    return result.records[0]
        .get("c")
        .properties;
}


// ==========================================
// CREATE IMPORT RELATIONSHIP
// ==========================================

async function createImport(
    owner,
    repo,
    sourcePath,
    targetPath
) {
    if (!sourcePath || !targetPath) return null;

    const result =
        await driver.executeQuery(
            `
            MERGE (source:File {
                owner: $owner,
                repository: $repo,
                path: $sourcePath
            })

            MERGE (target:File {
                owner: $owner,
                repository: $repo,
                path: $targetPath
            })

            MERGE (source)-[:IMPORTS]->(target)

            RETURN source, target
            `,
            {
                owner,
                repo,
                sourcePath,
                targetPath
            }
        );


    return result.records[0] || null;
}


// ==========================================
// CREATE CALL RELATIONSHIP
// ==========================================

async function createCall(
    owner,
    repo,
    callerFile,
    callerName,
    calleeName
) {
    if (!callerName || !calleeName) return [];

    /*
     Example:

     authService.authenticate

     becomes:

     authenticate
    */

    const cleanCallee =
        calleeName.includes(".")
            ? calleeName.split(".").pop()
            : calleeName;


    const result =
        await driver.executeQuery(
            `
            MATCH (caller:Function {
                owner: $owner,
                repository: $repo,
                filePath: $callerFile,
                name: $callerName
            })

            MATCH (callee:Function {
                owner: $owner,
                repository: $repo,
                name: $cleanCallee
            })

            MERGE (caller)-[:CALLS]->(callee)

            RETURN
                caller.name AS caller,
                callee.name AS callee
            `,
            {
                owner,
                repo,
                callerFile,
                callerName,
                cleanCallee
            }
        );


    return result.records.map(
        record => ({

            caller:
                record.get("caller"),

            callee:
                record.get("callee")
        })
    );
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createFunction,

    createClass,

    createImport,

    createCall

};