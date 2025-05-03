document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Text solve button
    document.getElementById('solve-btn').addEventListener('click', async () => {
        const input = document.getElementById('math-input').value.trim();
        if (!input) return alert('Please enter a math problem');
        
        try {
            const response = await fetch('/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression: input })
            });
            
            const data = await response.json();
            
            if (data.error) {
                document.getElementById('result').innerHTML = 
                    `<div class="error">${data.error}</div>`;
                document.getElementById('steps').innerHTML = '';
            } else {
                document.getElementById('result').innerHTML = 
                    `<div class="success">Answer: ${data.result}</div>`;
                
                const stepsHtml = data.steps.map(step => 
                    `<div class="step">${step}</div>`
                ).join('');
                document.getElementById('steps').innerHTML = stepsHtml;
            }
        } catch (error) {
            document.getElementById('result').innerHTML = 
                `<div class="error">Error processing request</div>`;
            document.getElementById('steps').innerHTML = '';
        }
    });
    
    // Image upload functionality
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    
    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button id="solve-image-btn" class="primary-btn">Solve This Problem</button>
            `;
            
            // Add event listener to the new button
            document.getElementById('solve-image-btn').addEventListener('click', async () => {
                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        document.getElementById('result').innerHTML = 
                            `<div class="error">${data.error}</div>`;
                        document.getElementById('steps').innerHTML = '';
                    } else {
                        document.getElementById('result').innerHTML = `
                            <div class="success">Answer: ${data.result}</div>
                            <div class="original-text">Extracted text: "${data.extracted}"</div>
                        `;
                        
                        const stepsHtml = data.steps.map(step => 
                            `<div class="step">${step}</div>`
                        ).join('');
                        document.getElementById('steps').innerHTML = stepsHtml;
                    }
                } catch (error) {
                    document.getElementById('result').innerHTML = 
                        `<div class="error">Error processing image</div>`;
                    document.getElementById('steps').inner
