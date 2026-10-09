const {
    searchFunctions
} = require("./graphRetriever");

const {
    generateAnswer
} = require("../config/groq");

const {
    buildPrompt
} = require("./prompt");


async function answerQuestion(
    owner,
    repo,
    question
) {

    const words =
        question
            .toLowerCase()
            .split(/\s+/)
            .filter(
                word => word.length > 2
            );


    let graphContext = [];


    for (const word of words) {

        const results =
            await searchFunctions(
                owner,
                repo,
                word
            );

        graphContext.push(
            ...results
        );
    }


    // Remove duplicate results

    graphContext =
        graphContext.filter(
            (item, index, array) =>
                index ===
                array.findIndex(
                    other =>
                        other.file === item.file &&
                        other.function === item.function
                )
        );


    const prompt =
        buildPrompt(
            question,
            graphContext
        );


    const answer =
        await generateAnswer(
            prompt
        );


    return {
        answer,
        context: graphContext
    };
}


module.exports = {
    answerQuestion
};