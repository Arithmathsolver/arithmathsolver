
const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const imagePath = req.file.path;

  Tesseract.recognize(imagePath, 'eng', {
    logger: m => console.log(m)
  })
    .then(({ data: { text } }) => {
      console.log(text);
      res.send({ extractedText: text });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('OCR failed');
    })
    .finally(() => {
      fs.unlink(imagePath, err => {
        if (err) console.error('Failed to delete uploaded file:', err);
      });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
