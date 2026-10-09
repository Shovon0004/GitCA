const driver = require("../config/neo4j");


async function analyzeFunctionImpact(
    owner,
    repo,
    functionName
) {

    const result =
        await driver.executeQuery(
            `
            MATCH (target:Function {
                owner: $owner,
                repository: $repo,
                name: $functionName
            })

            OPTIONAL MATCH
                (caller:Function)-[:CALLS*1..3]->(target)

            OPTIONAL MATCH
                (target)-[:CALLS*1..3]->(callee:Function)

            OPTIONAL MATCH
                (targetFile:File)-[:CONTAINS]->(target)

            OPTIONAL MATCH
                (importer:File)-[:IMPORTS]->(targetFile)

            RETURN
                target.name AS function,
                targetFile.path AS file,

                collect(DISTINCT caller.name)
                    AS callers,

                collect(DISTINCT callee.name)
                    AS callees,

                collect(DISTINCT importer.path)
                    AS importedBy
            `,
            {
                owner,
                repo,
                functionName
            }
        );


    if (result.records.length === 0) {

        return null;
    }


    const record =
        result.records[0];


    return {

        function:
            record.get("function"),

        file:
            record.get("file"),

        callers:
            record.get("callers"),

        callees:
            record.get("callees"),

        importedBy:
            record.get("importedBy")
    };
}


module.exports = {
    analyzeFunctionImpact
};