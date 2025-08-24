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

// Root route
app.get("/", (req, res) => {
  res.send("Kurukh-Hindi Translator Server is running!");
});

// Translation API
app.post("/translate", (req, res) => {
  const { text } = req.body;
  const translatedText = lexicon[text]
    ? lexicon[text].hindi
    : "अनुवाद नहीं मिला";
  res.json({ translation: translatedText });
});

// Serve static files (like index.html inside /public)
app.use(express.static(path.join(__dirname, "public")));

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from KRX-HI API 🚀" });
});

// Start server on custom port (default: 8080)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`krx-hi API running on http://localhost:${PORT}`);
});
