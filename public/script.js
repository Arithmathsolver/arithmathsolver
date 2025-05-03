
document.getElementById('solve-btn').addEventListener('click', async () => {
  const input = document.getElementById('math-input').value.trim();

  if (!input) return alert('Please enter a math problem');

  const response = await fetch('/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem: input })
  });

  const data = await response.json();
  document.getElementById('result').innerText = data.solution || data.error;
});

document.getElementById('image-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/solve-image', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  document.getElementById('result').innerText = data.solution || data.error;
});
