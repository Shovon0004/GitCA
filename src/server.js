const express = require("express");

const driver =
    require("./config/neo4j");

const ragRoutes =
    require("./routes/rag");


const app =
    express();


app.use(
    express.json()
);


app.get(
    "/",
    (req, res) => {

        res.json({
            message:
                "GraphCodeRAG API is running"
        });
    }
);


app.get(
    "/test-db",
    async (req, res) => {

        try {

            const result =
                await driver.executeQuery(
                    "RETURN 'Neo4j connected!' AS message"
                );


            res.json({
                success: true,

                message:
                    result.records[0]
                        .get("message")
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);


app.use(
    "/api/rag",
    ragRoutes
);


app.listen(
    process.env.PORT || 5000,
    () => {

        console.log(
            `Server running on http://localhost:${process.env.PORT || 5000}`
        );
    }
);