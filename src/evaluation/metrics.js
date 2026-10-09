function calculateCorrectness(
    answer,
    expected
) {

    const normalizedAnswer =
        answer.toLowerCase();


    let matched = 0;


    for (const item of expected) {

        if (
            normalizedAnswer.includes(
                item.toLowerCase()
            )
        ) {

            matched++;
        }
    }


    if (expected.length === 0) {
        return 0;
    }


    return matched / expected.length;
}


function calculateRelevance(
    context,
    question
) {

    if (
        !context ||
        context.length === 0
    ) {

        return 0;
    }


    const words =
        question
            .toLowerCase()
            .split(/\s+/)
            .filter(
                word => word.length > 3
            );


    let matches = 0;


    const contextText =
        JSON.stringify(
            context
        ).toLowerCase();


    for (const word of words) {

        if (
            contextText.includes(word)
        ) {

            matches++;
        }
    }


    if (words.length === 0) {
        return 0;
    }


    return matches / words.length;
}


module.exports = {
    calculateCorrectness,
    calculateRelevance
};