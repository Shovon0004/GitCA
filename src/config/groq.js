const Groq = require("groq-sdk");

require("dotenv").config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


async function generateAnswer(prompt) {

    const completion =
        await groq.chat.completions.create({

            model:
                process.env.GROQ_MODEL ||
                "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert codebase analysis assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature: 0.1
        });


    return completion
        .choices[0]
        .message
        .content;
}


module.exports = {
    generateAnswer
};