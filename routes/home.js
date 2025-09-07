// routes/home.js
const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  // Serve your main entry point HTML file from the public folder
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = router;