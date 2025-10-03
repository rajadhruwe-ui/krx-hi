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
    lexicon[row.kurukh.toLowerCase()] = {
      hindi: row.hindi,
      pos: row.pos,
      notes: row.notes
    };
  })
  .on("end", () => {
    console.log("Lexicon loaded:", Object.keys(lexicon).length, "entries");
  });

// Serve static files (like index.html inside /public)
app.use(express.static(path.join(__dirname, "public")));

// Root route (redirect to index.html if you like)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Translation API
app.post("/translate", (req, res) => {
  if (Object.keys(lexicon).length === 0) {
    return res.status(503).json({ translation: "⚠️ Lexicon not loaded yet" });
  }

  const { text } = req.body;
  if (!text) return res.json({ translation: "❌ कोई शब्द प्रदान नहीं किया गया" });

  const key = text.trim().toLowerCase();
  const translatedText = lexicon[key] ? lexicon[key].hindi : "अनुवाद नहीं मिला";

  res.json({ translation: translatedText });
});

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from KRX-HI API 🚀" });
});

// Start server on custom port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`krx-hi API running on http://localhost:${PORT}`);
});
