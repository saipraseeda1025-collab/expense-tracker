require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const expenseRoutes = require("./routes/expenses");
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => {
    res.send("Expense Tracker Backend Running");
});

// Auth routes
app.use("/auth", require("./routes/auth"));
app.use("/expenses", expenseRoutes);

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});