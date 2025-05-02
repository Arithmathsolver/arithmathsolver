document.getElementById('solve-btn').addEventListener('click', async () => {
  const input = document.getElementById('text-input').value.trim();
  const imageFile = document.getElementById('image-upload').files[0];

  const output = document.getElementById('solution-output');
  output.textContent = 'Solving...';

  try {
    let response;

    if (imageFile) {
      // Handle image upload
      const formData = new FormData();
      formData.append('image', imageFile);

      response = await fetch('/solve-image', {
        method: 'POST',
        body: formData
      });
    } else if (input) {
      // Handle text problem
      response = await fetch('/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ problem: input })
      });
    } else {
      output.textContent = 'Please enter a math problem or upload an image.';
      return;
    }

    const data = await response.json();

    if (response.ok) {
      output.textContent = data.solution || 'No solution returned.';
    } else {
      output.textContent = data.error || 'Error solving problem.';
    }
  } catch (err) {
    output.textContent = 'Network error. Please try again.';
    console.error(err);
  }
});
