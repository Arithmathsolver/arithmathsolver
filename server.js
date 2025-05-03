const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const tesseract = require('tesseract.js');
const math = require('mathjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Normalize expression by replacing × and ÷
function normalizeMathExpression(expr) {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/');
}

// Route to handle solving math expressions
app.post('/solve', (req, res) => {
  try {
    let expression = req.body.expression;
    expression = normalizeMathExpression(expression);
    const result = math.evaluate(expression);
    res.json({ result });
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
    const normalized = normalizeMathExpression(text);
    const answer = math.evaluate(normalized);
    res.json({ extracted: text, result: answer });
  } catch (error) {
    res.status(400).json({ error: 'Could not solve the extracted math.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
