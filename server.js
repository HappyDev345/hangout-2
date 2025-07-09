const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('.'));
app.use(express.json());

// Simple in-memory store for availability
let dataStore = {};

// Change this password to something strong and keep it secret!
const ADMIN_PASSWORD = 'supersecret123';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
  const { name, slots } = req.body;
  if (!name || !slots) return res.status(400).json({ error: "Missing name or slots" });

  dataStore[name] = slots;
  console.log(`✅ Availability saved for ${name}`);
  res.json({ success: true });
});

app.get('/get', (req, res) => {
  console.log("📊 Sending data:", dataStore);
  res.json(dataStore);
});

app.post('/reset', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Wrong password' });
  }
  dataStore = {};
  console.log("🔁 All availability cleared by admin.");
  res.json({ message: 'All responses reset.' });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
