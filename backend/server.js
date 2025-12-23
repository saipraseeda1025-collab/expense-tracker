const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/expenses")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => {
    res.send("Expense Tracker Backend Running");
});

// Auth routes
app.use("/auth", require("./routes/auth"));

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});