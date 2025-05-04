const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const multer = require("multer");
const fs = require("fs");
const Tesseract = require("tesseract.js");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/solve", async (req, res) => {
    const { problem } = req.body;

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a university-level math tutor. Solve the problem step-by-step.",
                },
                {
                    role: "user",
                    content: problem,
                },
            ],
        });

        const solution = response.data.choices[0].message.content;
        res.json({ solution });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to solve the problem.");
    }
});

const upload = multer({ dest: "uploads/" });

app.post("/solve-image", upload.single("image"), async (req, res) => {
    const imagePath = req.file.path;

    try {
        const ocrResult = await Tesseract.recognize(imagePath, "eng");
        const extractedText = ocrResult.data.text;

        fs.unlinkSync(imagePath); // Clean up uploaded file

        const gptResponse = await openai.createChatCompletion({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a university-level math tutor. Solve the problem step-by-step.",
                },
                {
                    role: "user",
                    content: extractedText,
                },
            ],
        });

        const solution = gptResponse.data.choices[0].message.content;
        res.json({ extractedText, solution });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing image.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
