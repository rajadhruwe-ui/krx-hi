const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Load lexicon from CSV
let lexicon = {};

try {
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
} catch (err) {
  console.error("Error loading lexicon.csv:", err.message);
}

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

// API endpoint with try-catch
app.post('/translate', (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Input text is required." });
    }

    const hindiText = ruleBasedTranslate(text);
    res.json({ translation: hindiText });

  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Server error while translating." });
  }
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Unexpected server error." });
});

// Start server
const PORT = 80;
app.listen(PORT, () => {
  console.log(`✅ Translation server running on http://localhost:${PORT}`);
});
