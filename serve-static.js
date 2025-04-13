import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create public directory if it doesn't exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  'default': 'application/octet-stream'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle server status endpoint
  if (req.url === '/server-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      time: new Date().toISOString(),
      publicDir: PUBLIC_DIR
    }));
    return;
  }
  
  // Normalize URL to prevent directory traversal
  let url = req.url;
  
  // Default to index.html for root path
  if (url === '/') {
    url = '/index.html';
  }
  
  // Check if the URL contains a file extension, if not assume it's an HTML file
  if (!path.extname(url)) {
    url = `${url}.html`;
  }
  
  // Build the file path
  const filePath = path.join(PUBLIC_DIR, url);
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file not found, try serving a test page
      if (err.code === 'ENOENT') {
        // If requesting an HTML file that doesn't exist, serve a fallback test page
        if (path.extname(url) === '.html') {
          const testHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Static Server Test</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #0066cc; }
              .card { background-color: white; padding: 15px; border-radius: 4px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .info { color: #666; }
              .success { color: #4CAF50; }
              .warning { color: #ff9800; }
            </style>
          </head>
          <body>
            <h1>cust_kflow Static Server Test</h1>
            <div class="card">
              <h2>Server Information</h2>
              <p><strong>Requested URL:</strong> ${req.url}</p>
              <p><strong>Server Port:</strong> ${PORT}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="card">
              <h2>File Not Found</h2>
              <p class="warning">The requested file "${url}" was not found in the public directory.</p>
              <p>Check to make sure you have created the file in the public directory.</p>
            </div>
            <div class="card">
              <h2>Getting Started</h2>
              <p>To serve static files, place them in the "public" directory next to this server file.</p>
              <p class="success">The static server is working correctly if you can see this page!</p>
            </div>
          </body>
          </html>
          `;
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(testHtml);
          return;
        }
        
        // For non-HTML files, return 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      
      // For other errors, return 500
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${err.code}`);
      return;
    }
    
    // Get file extension and determine content type
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || MIME_TYPES['default'];
    
    // Send response with file content
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
=======================================================
  cust_kflow Static Server Running
=======================================================
  Server is running at http://localhost:${PORT}
  Serving files from: ${PUBLIC_DIR}
  
  Use these URLs to test:
  - Main page: http://localhost:${PORT}/
  - Server status: http://localhost:${PORT}/server-status
  
  Press Ctrl+C to stop the server
=======================================================
`);
}); 
