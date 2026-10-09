const {
    searchFunctions,
    getFileGraphContext
} = require("./graphRetriever");

const {
    searchSimilar
} = require("../vector/vectorStore");


function extractKeywords(question) {

    const words =
        question
            .toLowerCase()
            .replace(
                /[^a-zA-Z0-9_]/g,
                " "
            )
            .split(/\s+/)
            .filter(
                word =>
                    word.length > 3
            );


    const keywordMap = {

        authentication: [
            "authenticate",
            "auth",
            "login"
        ],

        authentication: [
            "authenticate",
            "auth",
            "login"
        ],

        login: [
            "login",
            "authenticate",
            "auth"
        ],

        auth: [
            "auth",
            "authenticate",
            "login"
        ],

        function: [
            "function"
        ],

        functions: [
            "function"
        ],

        implementation: [
            "authenticate",
            "login"
        ]
    };


    const keywords = [
        ...words
    ];


    for (const word of words) {

        if (keywordMap[word]) {

            keywords.push(
                ...keywordMap[word]
            );
        }
    }


    return [
        ...new Set(keywords)
    ];
}


async function hybridSearch(
    owner,
    repo,
    question
) {

    // --------------------------------
    // VECTOR SEARCH
    // --------------------------------

    const vectorResults =
        await searchSimilar(
            question,
            5
        );


    // --------------------------------
    // GRAPH SEARCH
    // --------------------------------

    let graphResults = [];


    // Search graph using question keywords

    const keywords =
        extractKeywords(
            question
        );


    for (const keyword of keywords) {

        const results =
            await searchFunctions(
                owner,
                repo,
                keyword
            );


        graphResults.push(
            ...results
        );
    }


    // --------------------------------
    // CONNECT VECTOR → GRAPH
    // --------------------------------

    for (
        const result
        of vectorResults
    ) {

        const graphContext =
            await getFileGraphContext(
                owner,
                repo,
                result.file
            );


        if (graphContext) {

            graphResults.push(
                graphContext
            );
        }
    }


    // --------------------------------
    // REMOVE DUPLICATES
    // --------------------------------

    graphResults =
        graphResults.filter(
            (item, index, array) => {

                const key =
                    item.file +
                    JSON.stringify(
                        item.function ||
                        item.functions ||
                        []
                    );

                return (
                    index ===
                    array.findIndex(
                        other => {

                            const otherKey =
                                other.file +
                                JSON.stringify(
                                    other.function ||
                                    other.functions ||
                                    []
                                );

                            return (
                                key ===
                                otherKey
                            );
                        }
                    )
                );
            }
        );


    return {

        graph:
            graphResults.slice(
                0,
                20
            ),

        vector:
            vectorResults.map(
                result => ({

                    file:
                        result.file,

                    text:
                        result.text,

                    score:
                        result.score
                })
            )
    };
}


module.exports = {
    hybridSearch
};