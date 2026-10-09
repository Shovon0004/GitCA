const fs = require("fs");
const path = require("path");

const {
    hybridAnswer
} = require("../rag/hybridAnswer");

const {
    calculateCorrectness,
    calculateRelevance
} = require("./metrics");


const questionsPath =
    path.join(
        __dirname,
        "questions.json"
    );


const resultsPath =
    path.join(
        __dirname,
        "results.json"
    );


const questions =
    JSON.parse(
        fs.readFileSync(
            questionsPath,
            "utf8"
        )
    );


async function evaluate() {

    const results = [];


    for (const item of questions) {

        console.log(
            `Evaluating question ${item.id}...`
        );


        const start =
            Date.now();


        const result =
            await hybridAnswer(
                "facebook",
                "react",
                item.question
            );


        const latency =
            Date.now() - start;


        const correctness =
            calculateCorrectness(
                result.answer,
                item.expected
            );


        const relevance =
            calculateRelevance(
                [
                    ...result.context.graph,
                    ...result.context.vector
                ],
                item.question
            );


        results.push({

            id:
                item.id,

            question:
                item.question,

            answer:
                result.answer,

            correctness:
                Number(
                    correctness.toFixed(2)
                ),

            relevance:
                Number(
                    relevance.toFixed(2)
                ),

            latencyMs:
                latency,

            graphResults:
                result.context.graph.length,

            vectorResults:
                result.context.vector.length
        });
    }


    const averageCorrectness =
        results.reduce(
            (sum, item) =>
                sum + item.correctness,
            0
        ) / results.length;


    const averageRelevance =
        results.reduce(
            (sum, item) =>
                sum + item.relevance,
            0
        ) / results.length;


    const averageLatency =
        results.reduce(
            (sum, item) =>
                sum + item.latencyMs,
            0
        ) / results.length;


    const output = {

        results,

        summary: {

            averageCorrectness:
                Number(
                    averageCorrectness.toFixed(2)
                ),

            averageRelevance:
                Number(
                    averageRelevance.toFixed(2)
                ),

            averageLatencyMs:
                Math.round(
                    averageLatency
                )
        }
    };


    fs.writeFileSync(
        resultsPath,
        JSON.stringify(
            output,
            null,
            2
        )
    );


    console.log(
        "\n=============================="
    );

    console.log(
        "EVALUATION COMPLETE"
    );

    console.log(
        "=============================="
    );

    console.log(
        JSON.stringify(
            output.summary,
            null,
            2
        )
    );
}


evaluate()
    .catch(error => {

        console.error(
            "Evaluation failed:"
        );

        console.error(error);

        process.exit(1);
    });