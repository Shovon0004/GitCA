const express = require("express");

const {
    hybridAnswer
} = require("../rag/hybridAnswer");

const {
    ingestFromGitHub,
    parseGitHubUrl
} = require("../ingestion/pipeline");


const router =
    express.Router();


// Ingest a GitHub repository (Clones + builds Graph + builds Vector index)
router.post(
    "/ingest",
    async (req, res) => {
        try {
            const { url, owner, repo } = req.body;

            const targetUrl = url || (owner && repo ? `${owner}/${repo}` : null);

            if (!targetUrl) {
                return res.status(400).json({
                    success: false,
                    error: "A GitHub URL ('url') or ('owner' and 'repo') is required."
                });
            }

            const result = await ingestFromGitHub(targetUrl);

            res.json(result);
        } catch (error) {
            console.error("Ingestion failed:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);


// Ask a question using Hybrid RAG (accepts either GitHub url OR owner/repo)
router.post(
    "/ask",
    async (req, res) => {

        try {

            let {
                url,
                owner,
                repo,
                question
            } = req.body;


            if (url && (!owner || !repo)) {
                try {
                    const parsed = parseGitHubUrl(url);
                    owner = parsed.owner;
                    repo = parsed.repo;
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        error: e.message
                    });
                }
            }


            if (
                !owner ||
                !repo ||
                !question
            ) {

                return res.status(400).json({
                    error:
                        "question and either a github 'url' or 'owner' and 'repo' are required"
                });
            }


            const result =
                await hybridAnswer(
                    owner,
                    repo,
                    question
                );


            res.json({
                success: true,
                ...result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);


module.exports = router;