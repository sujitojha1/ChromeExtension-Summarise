# Web Content Summarizer Chrome Extension

This Chrome extension uses Google's Gemini API to generate concise summaries of webpage content and highlight important links.

## Features

- Extracts main content from any webpage
- Identifies important links
- Generates AI-powered summaries using Gemini API
- Clean and modern user interface

## Setup Instructions

1. Clone or download this repository
2. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Open `popup.js` and replace `YOUR_GEMINI_API_KEY` with your actual API key
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any webpage you want to summarize
2. Click the extension icon in your Chrome toolbar
3. Click the "Summarize Page" button
4. Wait for the AI to generate a summary
5. The summary will include:
   - Main content overview
   - Key points
   - Important links with descriptions

## Files

- `manifest.json`: Extension configuration
- `popup.html`: Extension popup interface
- `popup.js`: Popup logic and API integration
- `content.js`: Content extraction script

## Note

Make sure to keep your Gemini API key secure and never share it publicly. The extension requires an active internet connection to function. 