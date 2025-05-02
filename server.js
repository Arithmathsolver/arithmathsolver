
const express = require('express');
const path = require('path');
const app = express();

// Middleware to parse incoming data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, JS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example POST route (adjust this according to your functionality)
app.post('/solve', (req, res) => {
  const { expression } = req.body;

  // Basic math expression evaluation (for demonstration)
  try {
    const result = eval(expression); // Replace with secure logic if needed
    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// Set port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
