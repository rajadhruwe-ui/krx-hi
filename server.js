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

// Rule-based translator
function ruleBasedTranslate(sentence) {
  const words = sentence.split(/\s+/);
  let translated = [];

  for (let w of words) {
    if (lexicon[w]) {
      translated.push(lexicon[w].hindi);
    } else {
      translated.push(w); // keep original if not found
    }
  }

  return translated.join(" ");
}

// API endpoint
app.post('/translate', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const translatedText = ruleBasedTranslate(text);
    res.json({ translation: translatedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

// Start server on port 80
const PORT = 80;
app.listen(PORT, () => {
  console.log(`Translation server running on http://localhost:${PORT}`);
});
