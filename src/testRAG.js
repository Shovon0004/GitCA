require("dotenv").config();


const {
    answerQuestion
} = require("./rag/answer");


answerQuestion(
    "facebook",
    "react",
    "Where is the login function and what does it call?"
)
    .then(result => {

        console.log(
            "\n=============================="
        );

        console.log(
            "ANSWER:"
        );

        console.log(
            result.answer
        );


        console.log(
            "\n=============================="
        );

        console.log(
            "GRAPH CONTEXT:"
        );

        console.log(
            JSON.stringify(
                result.context,
                null,
                2
            )
        );

        process.exit(0);
    })
    .catch(error => {

        console.error(
            "RAG failed:"
        );

        console.error(error);

        process.exit(1);
    });