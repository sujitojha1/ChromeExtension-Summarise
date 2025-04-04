import config from './config.js';

// Function to convert markdown-like text to HTML
function formatText(text) {
  return text
    // Convert bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Convert headings
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Convert lists
    .replace(/^\s*[-*]\s+(.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Convert line breaks
    .replace(/\n/g, '<br>');
}

// Function to show error message
function showError(message) {
  const errorDiv = document.getElementById('error');
  const errorMessage = errorDiv.querySelector('span');
  errorMessage.textContent = message;
  errorDiv.classList.add('visible');
  setTimeout(() => {
    errorDiv.classList.remove('visible');
  }, 5000);
}

// Function to show success message
function showSuccess() {
  const successDiv = document.querySelector('.success-message');
  successDiv.classList.add('visible');
  setTimeout(() => {
    successDiv.classList.remove('visible');
  }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
  const summarizeButton = document.getElementById('summarize');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const summaryDiv = document.getElementById('summary');
  const successDiv = document.querySelector('.success-message');

  summarizeButton.addEventListener('click', async () => {
    try {
      // Reset UI state
      loadingDiv.classList.add('visible');
      errorDiv.classList.remove('visible');
      successDiv.classList.remove('visible');
      summaryDiv.innerHTML = '';
      summarizeButton.disabled = true;

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Ensure content script is injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        console.log('Script might already be injected:', e);
      }

      // Wait a short moment to ensure the content script is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to send message to content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
      } catch (e) {
        throw new Error('Failed to communicate with the webpage. Please refresh the page and try again.');
      }
      
      if (!response) {
        throw new Error('No response received from the webpage');
      }

      // Prepare prompt for Gemini
      const prompt = `Please provide a concise summary of the following webpage content and highlight the most important links. 
      Format your response with markdown-style formatting:
      - Use **bold** for emphasis
      - Use # for headings
      - Use [text](url) for links
      - Use bullet points for lists
      
      Title: ${response.title}
      URL: ${response.url}
      Content: ${response.content.substring(0, 30000)} // Limiting content length
      
      Important links found:
      ${response.links.map(link => `- ${link.text}: ${link.href}`).join('\n')}
      
      Please provide a well-formatted response with:
      1. A brief summary of the main content
      2. Key points or takeaways
      3. Most relevant links with brief descriptions`;

      // Call Gemini API
      const apiResponse = await fetch(`${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      let data;
      try {
        data = await apiResponse.json();
      } catch (e) {
        throw new Error(`API Error: Failed to parse response. Status: ${apiResponse.status}`);
      }

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${data.error?.message || `Status ${apiResponse.status}`}`);
      }

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }
      
      const markdownSummary = data.candidates[0].content.parts[0].text;
      
      // Convert markdown to HTML and display
      summaryDiv.innerHTML = formatText(markdownSummary);
      showSuccess();
      
    } catch (error) {
      showError(error.message);
      console.error('Detailed error:', error);
    } finally {
      loadingDiv.classList.remove('visible');
      summarizeButton.disabled = false;
    }
  });
}); 