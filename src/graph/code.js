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

    const result =
        await driver.executeQuery(
            `
            MATCH (f:File {
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

    const result =
        await driver.executeQuery(
            `
            MATCH (f:File {
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

    const result =
        await driver.executeQuery(
            `
            MATCH (source:File {
                owner: $owner,
                repository: $repo,
                path: $sourcePath
            })

            MATCH (target:File {
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


    return result.records[0];
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