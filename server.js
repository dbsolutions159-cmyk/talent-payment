require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// TEST
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// FINAL FIXED ROUTE
app.post("/pay", (req, res) => {

  console.log("Incoming:", req.body);

  // 🔥 FIRST: response भेजो (IMPORTANT)
  res.json({ success: true });

  // 🔥 बाद में काम करो (background)
  setTimeout(() => {
    console.log("Background work done ✅");
  }, 1000);

});

app.listen(5000, () => console.log("Server running 🚀"));
