const express = require("express");

const {
    hybridAnswer
} = require("../rag/hybridAnswer");


const router =
    express.Router();


router.post(
    "/ask",
    async (req, res) => {

        try {

            const {
                owner,
                repo,
                question
            } = req.body;


            if (
                !owner ||
                !repo ||
                !question
            ) {

                return res.status(400).json({
                    error:
                        "owner, repo and question are required"
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