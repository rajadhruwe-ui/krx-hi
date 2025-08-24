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

// Start server on port 80
const PORT = 80;
app.listen(PORT, () => {
  console.log(`Translation server running on http://localhost:${PORT}`);
});
