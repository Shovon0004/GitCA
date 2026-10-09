const { cloneGitHubRepository, parseGitHubUrl } = require("./gitClone");
const { ingestRepository } = require("./ingestRepository");
const { indexRepository } = require("../vector/indexRepository");

/**
 * Full ingestion pipeline:
 * 1. Clones GitHub repository
 * 2. Parses code, AST entities, dependencies, calls & Git commits into Neo4j Graph
 * 3. Chunks and embeds files into Vector Store
 */
async function ingestFromGitHub(urlOrSlug) {
    console.log("==========================================");
    console.log(`Starting full ingestion for: ${urlOrSlug}`);
    console.log("==========================================");

    // Step 1: Clone or fetch repository
    const { owner, repo, localPath } = await cloneGitHubRepository(urlOrSlug);

    // Step 2: Neo4j Graph Ingestion
    console.log("\n[1/2] Ingesting into Knowledge Graph (Neo4j)...");
    const graphStats = await ingestRepository(owner, repo, localPath);

    // Step 3: Vector Store Ingestion
    console.log("\n[2/2] Generating Vector Embeddings...");
    const vectorStats = await indexRepository(owner, repo, localPath);

    console.log("\n==========================================");
    console.log("Ingestion completed successfully!");
    console.log(`Repository: ${owner}/${repo}`);
    console.log(`Files indexed in graph: ${graphStats.filesFound}`);
    console.log(`Commits indexed: ${graphStats.commitsFound}`);
    console.log(`Files indexed in vector store: ${vectorStats.indexedFiles}`);
    console.log("==========================================");

    return {
        success: true,
        owner,
        repo,
        localPath,
        graphStats,
        vectorStats
    };
}

module.exports = {
    ingestFromGitHub,
    parseGitHubUrl
};

