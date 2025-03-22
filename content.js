function extractContent() {
  // Remove script and style elements
  const scripts = document.getElementsByTagName('script');
  const styles = document.getElementsByTagName('style');
  const elementsToRemove = [...scripts, ...styles];
  elementsToRemove.forEach(element => element.remove());

  // Get the main content
  const content = document.body.innerText;
  
  // Extract links
  const links = Array.from(document.getElementsByTagName('a')).map(link => ({
    text: link.innerText,
    href: link.href
  }));

  return {
    content: content,
    links: links,
    url: window.location.href,
    title: document.title
  };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const data = extractContent();
    sendResponse(data);
  }
  return true;
}); 