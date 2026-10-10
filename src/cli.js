#!/usr/bin/env node
require("dotenv").config();
const readline = require("readline");
const { ingestFromGitHub, parseGitHubUrl } = require("./ingestion/pipeline");
const { hybridAnswer } = require("./rag/hybridAnswer");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    console.log("\n========================================================");
    console.log("🚀 GitCA - GitHub Ingestion & Question Assistant");
    console.log("========================================================\n");

    const repoInput = await prompt("Paste GitHub URL or owner/repo (e.g. https://github.com/facebook/react): ");

    if (!repoInput.trim()) {
        console.log("No URL provided. Exiting.");
        process.exit(0);
    }

    const { owner, repo } = parseGitHubUrl(repoInput);
    console.log(`\nSelected target repository: ${owner}/${repo}`);

    const shouldIngest = await prompt("Do you want to ingest/index this repository now? (Y/n): ");
    if (shouldIngest.toLowerCase() !== "n") {
        console.log("\nStarting ingestion pipeline...");
        await ingestFromGitHub(repoInput);
    }

    console.log(`\nReady! You can now ask questions about ${owner}/${repo}.`);
    console.log("Type 'exit' or 'quit' to stop.\n");

    while (true) {
        const question = await prompt(`\n[${owner}/${repo}] Ask a question: `);

        if (!question.trim()) continue;
        if (question.trim().toLowerCase() === "exit" || question.trim().toLowerCase() === "quit") {
            console.log("\nGoodbye!");
            process.exit(0);
        }

        console.log("\nAnalyzing code graph and vector store with LLM...");
        try {
            const result = await hybridAnswer(owner, repo, question);
            console.log("\n======================== ANSWER ========================");
            console.log(result.answer);
            console.log("========================================================");
            console.log(`[Evidence: ${result.context.graph.length} graph relations, ${result.context.vector.length} code snippets]\n`);
        } catch (error) {
            console.error("\nError generating answer:", error.message);
        }
    }
}

main().catch(err => {
    console.error("CLI encountered an error:", err);
    process.exit(1);
});

