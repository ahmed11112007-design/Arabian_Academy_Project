const express = require('express');
const app = express();
const PORT = 4000;

app.get('/', (req, res) => {
  res.send('Hello from the Secured App!');
});

app.listen(PORT, () => {
  console.log(`Secured app running at http://localhost:${PORT}`);
});