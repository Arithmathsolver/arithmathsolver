
const express = require('express');
const path = require('path');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const app = express();

// Middleware to parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up Multer for image uploads
const upload = multer({ dest: 'uploads/' });

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Text-based math solver
app.post('/solve', (req, res) => {
  const { problem } = req.body;

  try {
    const result = eval(problem);
    res.json({ solution: result.toString() });
  } catch (err) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// Image-based math solver
app.post('/solve-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = req.file.path;

  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    fs.unlinkSync(imagePath); // delete temp image

    const cleaned = text.replace(/[^0-9+\-*/().=]/g, '').trim();

    if (!cleaned) {
      return res.status(400).json({ error: 'No readable math expression found' });
    }

    const result = eval(cleaned);
    res.json({ solution: result.toString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process image or solve problem' });
  }
});

// Server listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
