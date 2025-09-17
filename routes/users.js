const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Get profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, email FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put("/profile", verifyToken, async (req, res) => {
  const { username, email } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET username=$1, email=$2 WHERE id=$3 RETURNING username, email",
      [username, email, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update password
router.put("/password", verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [req.user.id]);
    const user = result.rows[0];

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(401).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashedPassword, req.user.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
