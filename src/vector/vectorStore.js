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
        try {
            documents =
                JSON.parse(
                    fs.readFileSync(
                        VECTOR_FILE,
                        "utf8"
                    )
                );
        } catch (e) {
            documents = [];
        }
    }


    const existingIndex =
        documents.findIndex(
            d =>
                d.owner === document.owner &&
                d.repo === document.repo &&
                d.file === document.file
        );


    if (existingIndex >= 0) {
        documents[existingIndex] = {
            ...document,
            embedding
        };
    } else {
        documents.push({
            ...document,
            embedding
        });
    }


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
    limit = 5,
    owner = null,
    repo = null
) {

    if (
        !fs.existsSync(
            VECTOR_FILE
        )
    ) {

        return [];
    }


    let documents =
        JSON.parse(
            fs.readFileSync(
                VECTOR_FILE,
                "utf8"
            )
        );


    if (owner && repo) {
        const repoDocs = documents.filter(
            d => d.owner === owner && d.repo === repo
        );
        if (repoDocs.length > 0) {
            documents = repoDocs;
        }
    }


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