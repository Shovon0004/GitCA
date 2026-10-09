const {
    hybridSearch
} = require("./hybridRetriever");

const {
    generateAnswer
} = require("../config/groq");


async function hybridAnswer(
    owner,
    repo,
    question
) {

    const context =
        await hybridSearch(
            owner,
            repo,
            question
        );


    const prompt = `
You are an expert repository
code analysis assistant.

Answer the user's question using
the provided Graph and Vector context.

GRAPH CONTEXT:
${JSON.stringify(
    context.graph,
    null,
    2
)}

VECTOR CONTEXT:
${JSON.stringify(
    context.vector,
    null,
    2
)}

USER QUESTION:
${question}

Rules:

1. Do not invent repository information.
2. Prefer graph relationships when discussing
   dependencies, imports, calls, and structure.
3. Prefer vector context when explaining
   actual source-code content.
4. If the evidence is insufficient,
   clearly say so.
5. Mention relevant files and functions.
`;


    const answer =
        await generateAnswer(
            prompt
        );


    return {
        answer,
        context
    };
}


module.exports = {
    hybridAnswer
};