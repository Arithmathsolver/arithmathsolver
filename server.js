
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

// Updated POST route for solving problems
app.post('/solve', (req, res) => {
  const { problem } = req.body;

  try {
    const result = eval(problem); // Note: eval should be replaced with a safe parser in production
    res.json({ solution: result.toString() });
  } catch (err) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// Set port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
