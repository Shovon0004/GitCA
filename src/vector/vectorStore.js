const fs = require("fs");
const path = require("path");

const {
    generateEmbedding
} = require("./embedder");


const VECTOR_FILE =
    path.join(
        __dirname,
        "vectors.json"
    );


async function addDocument(
    document
) {

    const embedding =
        await generateEmbedding(
            document.text
        );


    let documents = [];


    if (
        fs.existsSync(
            VECTOR_FILE
        )
    ) {

        documents =
            JSON.parse(
                fs.readFileSync(
                    VECTOR_FILE,
                    "utf8"
                )
            );
    }


    documents.push({
        ...document,
        embedding
    });


    fs.writeFileSync(
        VECTOR_FILE,
        JSON.stringify(
            documents,
            null,
            2
        )
    );
}


function cosineSimilarity(
    a,
    b
) {

    let dot = 0;
    let normA = 0;
    let normB = 0;


    for (
        let i = 0;
        i < a.length;
        i++
    ) {

        dot +=
            a[i] * b[i];

        normA +=
            a[i] * a[i];

        normB +=
            b[i] * b[i];
    }


    return (
        dot /
        (
            Math.sqrt(normA) *
            Math.sqrt(normB)
        )
    );
}


async function searchSimilar(
    query,
    limit = 5
) {

    if (
        !fs.existsSync(
            VECTOR_FILE
        )
    ) {

        return [];
    }


    const documents =
        JSON.parse(
            fs.readFileSync(
                VECTOR_FILE,
                "utf8"
            )
        );


    const queryEmbedding =
        await generateEmbedding(
            query
        );


    return documents
        .map(document => ({

            ...document,

            score:
                cosineSimilarity(
                    queryEmbedding,
                    document.embedding
                )
        }))
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(0, limit);
}


module.exports = {
    addDocument,
    searchSimilar
};