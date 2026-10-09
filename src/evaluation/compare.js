const fs = require("fs");
const path = require("path");

const {
    answerQuestion
} = require("../rag/answer");

const {
    searchSimilar
} = require("../vector/vectorStore");

const {
    hybridAnswer
} = require("../rag/hybridAnswer");

const {
    calculateCorrectness
} = require("./metrics");


const questionsPath =
    path.join(
        __dirname,
        "questions.json"
    );


const questions =
    JSON.parse(
        fs.readFileSync(
            questionsPath,
            "utf8"
        )
    );


async function vectorAnswer(
    question
) {

    const results =
        await searchSimilar(
            question,
            5
        );


    const context =
        results.map(
            result => ({
                file:
                    result.file,

                text:
                    result.text,

                score:
                    result.score
            })
        );


    const prompt = `
You are a repository code analysis assistant.

Answer the question using ONLY
the vector retrieval context.

VECTOR CONTEXT:
${JSON.stringify(
    context,
    null,
    2
)}

QUESTION:
${question}

Do not invent information.
`;


    const {
        generateAnswer
    } = require("../config/groq");


    const answer =
        await generateAnswer(
            prompt
        );


    return {
        answer,
        context
    };
}


async function run() {

    const comparison = [];


    for (const item of questions) {

        console.log(
            `\nQuestion ${item.id}`
        );


        // GRAPH RAG
        const graphStart =
            Date.now();


        const graphResult =
            await answerQuestion(
                "facebook",
                "react",
                item.question
            );


        const graphLatency =
            Date.now() - graphStart;


        // VECTOR RAG
        const vectorStart =
            Date.now();


        const vectorResult =
            await vectorAnswer(
                item.question
            );


        const vectorLatency =
            Date.now() - vectorStart;


        // HYBRID RAG
        const hybridStart =
            Date.now();


        const hybridResult =
            await hybridAnswer(
                "facebook",
                "react",
                item.question
            );


        const hybridLatency =
            Date.now() - hybridStart;


        comparison.push({

            id:
                item.id,

            question:
                item.question,


            graph: {

                correctness:
                    calculateCorrectness(
                        graphResult.answer,
                        item.expected
                    ),

                latencyMs:
                    graphLatency
            },


            vector: {

                correctness:
                    calculateCorrectness(
                        vectorResult.answer,
                        item.expected
                    ),

                latencyMs:
                    vectorLatency
            },


            hybrid: {

                correctness:
                    calculateCorrectness(
                        hybridResult.answer,
                        item.expected
                    ),

                latencyMs:
                    hybridLatency
            }
        });
    }


    const outputPath =
        path.join(
            __dirname,
            "comparison.json"
        );


    fs.writeFileSync(

        outputPath,

        JSON.stringify(
            comparison,
            null,
            2
        )
    );


    console.log(
        "\n=============================="
    );

    console.log(
        "RAG COMPARISON COMPLETE"
    );

    console.log(
        "=============================="
    );


    console.log(
        JSON.stringify(
            comparison,
            null,
            2
        )
    );
}


run()
    .catch(error => {

        console.error(
            "Comparison failed:"
        );

        console.error(error);

        process.exit(1);
    });