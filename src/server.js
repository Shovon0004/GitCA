const express = require("express");
const path = require("path");

const driver =
    require("./config/neo4j");

const ragRoutes =
    require("./routes/rag");


const app =
    express();


app.use(
    express.json()
);

// Enable CORS for frontend running on Live Server or other ports
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);

app.use("/api/rag", ragRoutes);
app.use("/api", ragRoutes);
app.use("/", ragRoutes);


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