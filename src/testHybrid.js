require("dotenv").config();

const {
    hybridAnswer
} = require("./rag/hybridAnswer");


async function main() {

    const result =
        await hybridAnswer(
            "facebook",
            "react",
            "Where is authentication implemented and which functions are involved?"
        );


    console.log(
        "\n=============================="
    );

    console.log(
        "HYBRID RAG ANSWER"
    );

    console.log(
        "=============================="
    );


    console.log(
        result.answer
    );


    console.log(
        "\nGRAPH CONTEXT:"
    );

    console.log(
        JSON.stringify(
            result.context.graph,
            null,
            2
        )
    );


    console.log(
        "\nVECTOR CONTEXT:"
    );

    console.log(
        JSON.stringify(
            result.context.vector,
            null,
            2
        )
    );

    process.exit(0);
}


main()
    .catch(error => {

        console.error(
            "Hybrid RAG failed:"
        );

        console.error(error);

        process.exit(1);
    });