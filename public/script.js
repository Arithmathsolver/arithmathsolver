
document.getElementById('solveButton').addEventListener('click', async () => {
  const problem = document.getElementById('problemInput').value;
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch('https://ver.onrender.com/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ problem })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    resultDiv.innerText = `Answer: ${data.result}`;
  } catch (error) {
    resultDiv.innerText = 'Error solving problem.';
    console.error('Error:', error);
  }
});
