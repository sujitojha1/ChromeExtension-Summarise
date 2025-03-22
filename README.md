# Web Content Summarizer Chrome Extension

A Chrome extension that uses Google's Gemini API to generate concise summaries of webpage content and highlight important links.

## Features

- Generates AI-powered summaries using Gemini API
- Extracts and highlights important links from the page
- Modern, clean UI with Aptos font
- Wikipedia integration for complex terms
- Markdown-style formatting for better readability
- Real-time loading states and error handling

## Demo

Watch the extension in action: [YouTube Demo](https://www.youtube.com/watch?v=LC7HtyDqYi8)

## Installation

1. Clone this repository or download the source code
2. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Create a `config.js` file in the root directory with your API key:
   ```javascript
   const config = {
       GEMINI_API_KEY: 'YOUR_API_KEY_HERE',
       GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
   };
   export default config;
   ```
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Click "Summarize Page" to generate a summary
3. The summary will include:
   - Brief overview of the content
   - Key points and takeaways
   - Important links with descriptions
   - Wikipedia links for complex terms

## Security

- API keys are stored locally in `config.js`
- `config.js` is included in `.gitignore` to prevent accidental commits
- Content Security Policy is configured for secure API communication

## Development

The extension uses:
- Modern JavaScript (ES modules)
- Chrome Extension Manifest V3
- Gemini API for content summarization
- Aptos font for modern typography

## File Structure

```
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── config.js
├── fonts/
│   ├── Aptos-Regular.woff2
│   ├── Aptos-Medium.woff2
│   └── Aptos-SemiBold.woff2
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini API for content summarization
- Aptos font for modern typography
- Chrome Extension APIs 