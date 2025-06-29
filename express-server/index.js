const express = require('express');
const app = express();
const PORT = 3000;

// -------- MIDDLEWARE --------
app.use(express.json()); // Built-in middleware to parse JSON
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from the Home Route!');
});

app.get('/about', (req, res) => {
  res.send('About: This is a basic Express server.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
