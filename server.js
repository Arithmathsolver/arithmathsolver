const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// File storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Solve math from text
app.post('/solve', (req, res) => {
    const { problem } = req.body;
    try {
        const result = eval(problem);
        res.json({ solution: result });
    } catch (error) {
        res.json({ error: 'Invalid math expression.' });
    }
});

// Solve math from image
app.post('/solve-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.json({ error: 'No image uploaded.' });

    const imagePath = req.file.path;
    Tesseract.recognize(imagePath, 'eng')
        .then(({ data: { text } }) => {
            try {
                const cleaned = text.replace(/[^\d+\-*/().]/g, '').trim();
                const result = eval(cleaned);
                res.json({ solution: result });
            } catch (error) {
                res.json({ error: 'Could not solve the extracted math.' });
            }
        })
        .catch(() => res.json({ error: 'OCR failed.' }))
        .finally(() => {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
