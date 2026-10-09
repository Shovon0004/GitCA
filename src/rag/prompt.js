function buildPrompt(
    question,
    graphContext
) {

    return `
You are a codebase analysis assistant.

Answer the user's question using ONLY
the repository graph information provided below.

Do not invent files, functions, classes,
or relationships.

If the information is insufficient,
clearly say that the repository graph
does not contain enough information.

Repository Graph Context:
${JSON.stringify(
    graphContext,
    null,
    2
)}

User Question:
${question}

Give a clear technical answer.

Mention:
- relevant files
- relevant functions/classes
- relationships such as IMPORTS or CALLS
when available.
`;
}


module.exports = {
    buildPrompt
};