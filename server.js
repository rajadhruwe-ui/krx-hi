const path = require("path");
const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Load lexicon from CSV
let lexicon = {};

fs.createReadStream("lexicon.csv")
  .pipe(csv())
  .on("data", (row) => {
    lexicon[row.kurukh] = {
      hindi: row.hindi,
      pos: row.pos,
      notes: row.notes
    };
  })
  .on("end", () => {
    console.log("Lexicon loaded:", Object.keys(lexicon).length, "entries");
  });

// Root route to fix 'Cannot GET /'
app.get('/', (req, res) => {
  res.send('Kurukh-Hindi Translator Server is running!');
});

// Translation API
app.post('/translate', (req, res) => {
  const { text } = req.body;
  const translatedText = lexicon[text] ? lexicon[text].hindi : "अनुवाद नहीं मिला";
  res.json({ translation: translatedText });
});
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, "public")));

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from KRX-HI API 🚀" });
});

app.listen(PORT, () => {
  console.log(`krx-hi API running on http://localhost:${PORT}`);
});
// Start server on port 80
//const PORT = 80;
app.listen(PORT, () => {
  console.log(`Translation server running on http://localhost:${PORT}`);
});
