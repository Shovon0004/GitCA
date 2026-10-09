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
You are an expert repository and codebase analysis assistant.

Answer the user's question accurately and thoroughly using the provided Repository metadata, Git Activity, Graph relationships, and Vector code context.

REPOSITORY OVERVIEW:
${JSON.stringify(
    context.repository || {},
    null,
    2
)}

GIT ACTIVITY & CONTRIBUTORS:
${JSON.stringify(
    context.git || {},
    null,
    2
)}

CODE KNOWLEDGE GRAPH (Relationships, Functions, Imports, Calls):
${JSON.stringify(
    context.graph,
    null,
    2
)}

VECTOR CODE SNIPPETS:
${JSON.stringify(
    context.vector,
    null,
    2
)}

USER QUESTION:
${question}

Rules:
1. Do not invent repository information.
2. If asked about contributors, commit history, authors, or changed files, use the GIT ACTIVITY & CONTRIBUTORS data.
3. Prefer graph relationships when discussing dependencies, imports, calls, and code structure.
4. Prefer vector context when explaining actual source-code content.
5. If the evidence is insufficient, clearly say so.
6. Mention relevant files, functions, authors, and commit messages where helpful.
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