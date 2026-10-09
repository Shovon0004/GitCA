const {
    analyzeFunctionImpact
} = require("./rag/impactAnalysis");


async function main() {

    const result =
        await analyzeFunctionImpact(
            "facebook",
            "react",
            "authenticate"
        );


    console.log(
        "\n=============================="
    );

    console.log(
        "FUNCTION IMPACT ANALYSIS"
    );

    console.log(
        "=============================="
    );


    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

    process.exit(0);
}


main()
    .catch(error => {

        console.error(
            "Impact analysis failed:"
        );

        console.error(error);

        process.exit(1);
    });