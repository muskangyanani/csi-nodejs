const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true); // parse query params
  const fileName = parsedUrl.query.name;
  const content = parsedUrl.query.content;
  const filePath = path.join(__dirname, 'files', fileName || '');

  res.setHeader('Content-Type', 'text/plain');

  if (req.url.startsWith('/create')) {
    if (!fileName || !content) {
      res.end('Missing file name or content');
      return;
    }

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        res.end('Error creating file');
      } else {
        res.end(`File '${fileName}' created successfully`);
      }
    });
  }

  else if (req.url.startsWith('/read')) {
    if (!fileName) {
      res.end('Missing file name');
      return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.end('File not found');
      } else {
        res.end(`Content of '${fileName}':\n\n${data}`);
      }
    });
  }

  else if (req.url.startsWith('/delete')) {
    if (!fileName) {
      res.end('Missing file name');
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        res.end('File not found or error deleting');
      } else {
        res.end(`File '${fileName}' deleted successfully`);
      }
    });
  }

  else {
    res.end('Available routes: /create?name=..&content=.. | /read?name=.. | /delete?name=..');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
