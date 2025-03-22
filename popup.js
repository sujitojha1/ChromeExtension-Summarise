// Replace with your Gemini API key
const GEMINI_API_KEY = 'AIzaSyBOO1mZSMtx8JANU24AwACUERkr8XvUbvQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

document.addEventListener('DOMContentLoaded', function() {
  const summarizeButton = document.getElementById('summarize');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const summaryDiv = document.getElementById('summary');

  summarizeButton.addEventListener('click', async () => {
    try {
      // Show loading state
      loadingDiv.style.display = 'block';
      errorDiv.textContent = '';
      summaryDiv.innerHTML = '';

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Ensure content script is injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        // Script might already be injected, continue
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
      const apiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

      let errorData;
      try {
        errorData = await apiResponse.json();
      } catch (e) {
        throw new Error(`API Error: Failed to parse response. Status: ${apiResponse.status}`);
      }

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${errorData.error?.message || `Status ${apiResponse.status}`}`);
      }

      if (!errorData.candidates || !errorData.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }
      
      const markdownSummary = errorData.candidates[0].content.parts[0].text;
      
      // Convert markdown to HTML and display
      summaryDiv.innerHTML = formatText(markdownSummary);
      
    } catch (error) {
      errorDiv.textContent = `Error: ${error.message}`;
      console.error('Detailed error:', error);
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
}); 