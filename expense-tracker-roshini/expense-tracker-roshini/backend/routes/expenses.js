const express = require("express");
const Expense = require("../models/Expense");
//@ts-ignore
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add expense
router.post("/", authMiddleware, async (req, res) => {
  const { title, amount, date } = req.body;

  try {
    const expense = new Expense({
      title,
      amount,
      date,
      user: req.user.id
    });

    await expense.save();
    res.status(201).json({ message: "Expense added", expense });
  } catch (err) {
    res.status(500).json({ message: "Error adding expense" });
  }
});

// Get expenses
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

// Delete expense
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting expense" });
  }
});

module.exports = router;
