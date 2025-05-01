
// Load environment variables (requires: npm install dotenv)
require('dotenv').config();

const solveBtn = document.getElementById('solve-btn');
const textInput = document.getElementById('text-input');
const imageUpload = document.getElementById('image-upload');
const outputArea = document.getElementById('solution-output');

let uploadedImage = null;

imageUpload.addEventListener('change', (e) => {
  uploadedImage = e.target.files[0];
});

solveBtn.addEventListener('click', async () => {
  outputArea.innerHTML = "Solving...";

  const formData = new FormData();

  if (uploadedImage) {
    formData.append("image", uploadedImage);
  }

  formData.append("text", textInput.value);

  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/your-endpoint", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`
    },
    body: formData
  });

  const result = await response.json();
  outputArea.innerHTML = JSON.stringify(result, null, 2);
});
