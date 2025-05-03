const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const tesseract = require("tesseract.js");
const math = require("mathjs");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to convert word problems to math expressions
function convertWordProblemToMath(problem) {
    // Simple conversions (you can expand this)
    problem = problem.toLowerCase()
        .replace(/plus/g, '+')
        .replace(/minus/g, '-')
        .replace(/times|multiplied by/g, '*')
        .replace(/divided by/g, '/')
        .replace(/what is|calculate|find/g, '')
        .replace(/\?/g, '');
    return problem.trim();
}

// Route to handle solving math expressions with steps
app.post('/solve', (req, res) => {
    try {
        let expression = req.body.expression;
        
        // Check if it's a word problem
        if (/[a-zA-Z]/.test(expression)) {
            expression = convertWordProblemToMath(expression);
        }
        
        // Get step-by-step solution
        const steps = [];
        const node = math.parse(expression);
        steps.push(`Original expression: ${expression}`);
        steps.push(`Parsed expression: ${node.toString()}`);
        
        const simplified = math.simplify(node);
        steps.push(`Simplified form: ${simplified.toString()}`);
        
        const result = math.evaluate(expression);
        steps.push(`Final result: ${result}`);
        
        res.json({ result, steps });
    } catch (error) {
        res.status(400).json({ error: 'Invalid math expression.' });
    }
});

// Route to handle image uploads and extract math expression
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { buffer } = req.file;
        const result = await tesseract.recognize(buffer, 'eng');
        const text = result.data.text.trim();
        
        let expression = text;
        if (/[a-zA-Z]/.test(text)) {
            expression = convertWordProblemToMath(text);
        }
        
        const node = math.parse(expression);
        const simplified = math.simplify(node);
        const answer = math.evaluate(expression);
        
        res.json({ 
            extracted: text, 
            result: answer,
            steps: [
                `Extracted text: ${text}`,
                `Converted expression: ${expression}`,
                `Parsed expression: ${node.toString()}`,
                `Simplified form: ${simplified.toString()}`,
                `Final result: ${answer}`
            ]
        });
    } catch (error) {
        res.status(400).json({ error: 'Could not solve the extracted math.' });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Advanced Math Solver</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <div class="container">
            <h1>Advanced Math Problem Solver</h1>
            <div class="tabs">
                <button class="tab-btn active" data-tab="text">Text Input</button>
                <button class="tab-btn" data-tab="image">Image Upload</button>
            </div>
            
            <div id="text-tab" class="tab-content active">
                <textarea id="math-input" placeholder="Enter math problem (e.g., '2+2' or 'what is 5 plus 3')"></textarea>
                <button id="solve-btn">Solve</button>
            </div>
            
            <div id="image-tab" class="tab-content">
                <div class="upload-container">
                    <input type="file" id="image-input" accept="image/*">
                    <label for="image-input" class="upload-btn">Choose Image</label>
                </div>
            </div>
            
            <div class="result-container">
                <h2>Solution</h2>
                <div id="result"></div>
                <div id="steps"></div>
            </div>
        </div>
        <script src="/script.js"></script>
    </body>
    </html>
    `);
});

// Serve static files
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
