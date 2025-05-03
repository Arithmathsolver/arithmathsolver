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

// Route to serve frontend form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; padding: 20px;">
        <h2>Upload Math Expression Image</h2>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="image" required />
          <button type="submit">Solve</button>
        </form>
        <br />
        <h2>Solve via Text</h2>
        <form id="textForm">
          <input type="text" id="expression" placeholder="e.g. 12 × 4" required />
          <button type="submit">Solve</button>
        </form>
        <div id="result"></div>
        <script>
          const form = document.getElementById('textForm');
          form.onsubmit = async (e) => {
            e.preventDefault();
            const expression = document.getElementById('expression').value;
            const res = await fetch('/solve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expression })
            });
            const data = await res.json();
            document.getElementById('result').innerText = 'Result: ' + (data.result ?? data.error);
          };
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
