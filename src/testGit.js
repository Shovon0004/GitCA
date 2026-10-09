require("dotenv").config();

const {
    isGitRepository,
    getCommits,
    getChangedFiles
} = require("./ingestion/git");

const {
    createCommit,
    connectCommitToFile
} = require("./graph/git");

const driver = require("./config/neo4j");


async function main() {
    const repoPath = "./test-repository";
    const owner = "facebook";
    const repo = "react";

    console.log("==============================");
    console.log("GIT CHECKER / TEST");
    console.log("==============================");

    console.log(`Checking repository at: ${repoPath}`);
    const isGit = isGitRepository(repoPath);
    console.log(`Is Git repository: ${isGit}`);

    if (!isGit) {
        console.warn("Target folder is not a git repository. Skipping commit tests.");
        process.exit(0);
    }

    const commits = getCommits(repoPath);
    console.log(`\nFound ${commits.length} commits:`);
    console.log(JSON.stringify(commits, null, 2));

    for (const commit of commits) {
        console.log(`\nProcessing commit: ${commit.hash.substring(0, 7)} - ${commit.message}`);
        await createCommit(owner, repo, commit);

        const changedFiles = getChangedFiles(repoPath, commit.hash);
        console.log(`Changed files (${changedFiles.length}):`, changedFiles);

        for (const file of changedFiles) {
            await connectCommitToFile(commit.hash, owner, repo, file);
        }
    }

    // Verify in Neo4j
    const verification = await driver.executeQuery(
        `
        MATCH (r:Repository {owner: $owner, name: $repo})-[:HAS_COMMIT]->(c:Commit)
        OPTIONAL MATCH (c)-[:MODIFIES]->(f:File)
        RETURN c.hash AS hash, c.message AS message, collect(f.path) AS modifiedFiles
        `,
        { owner, repo }
    );

    console.log("\n==============================");
    console.log("NEO4J VERIFICATION RESULTS:");
    console.log("==============================");
    console.log(
        JSON.stringify(
            verification.records.map(r => ({
                hash: r.get("hash"),
                message: r.get("message"),
                modifiedFiles: r.get("modifiedFiles")
            })),
            null,
            2
        )
    );

    await driver.close();
    process.exit(0);
}

main().catch(error => {
    console.error("Git check failed:", error);
    process.exit(1);
});

