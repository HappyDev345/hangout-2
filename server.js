const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 🔐 Replace YOUR_PASSWORD_HERE with your real MongoDB password (URL-encoded if needed)
const mongoURI = 'mongodb+srv://appuser:Banana@cluster1.2bkbwyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let db, responsesCollection;

// Connect to MongoDB
MongoClient.connect(mongoURI, { useUnifiedTopology: true })
  .then(client => {
    console.log('✅ Connected to MongoDB Atlas');
    db = client.db('scheduler');
    responsesCollection = db.collection('responses');
  })
  .catch(error => console.error('❌ MongoDB connection error:', error));

// Submit user availability
app.post('/submit', async (req, res) => {
  const { name, slots } = req.body;
  if (!name || !slots || !Array.isArray(slots)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    await responsesCollection.updateOne(
      { name },
      { $set: { slots } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all responses
app.get('/get', async (req, res) => {
  try {
    const all = await responsesCollection.find().toArray();
    const result = {};
    all.forEach(entry => {
      result[entry.name] = entry.slots;
    });
    res.json(result);
  } catch (err) {
    console.error('Get error:', err);
    res.status(500).json({ error: 'Fetch error' });
  }
});

// Reset responses (admin-only)
const ADMIN_PASSWORD = 'supersecret123';

app.post('/reset', async (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await responsesCollection.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Reset error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
