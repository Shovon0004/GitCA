const {
    createSchema
} = require("./graph/schema");


createSchema()
    .then(() => {

        console.log(
            "Neo4j schema setup complete."
        );

        process.exit(0);
    })
    .catch(error => {

        console.error(
            "Schema creation failed:"
        );

        console.error(error);

        process.exit(1);
    });