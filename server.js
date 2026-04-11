require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// MAIN API
app.post("/pay", async (req, res) => {
  try {
    console.log("Incoming:", req.body);

    const { name, email, txn, amount } = req.body;

    // Save to Supabase
    const { error } = await supabase.from("payments").insert([
      { name, email, txn, amount, status: "success" }
    ]);

    if (error) {
      console.log(error);
      return res.json({ success: false });
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Payment Confirmed",
      html: `
        <h2>Payment Success</h2>
        <p>Name: ${name}</p>
        <p>Amount: ₹${amount}</p>
        <p>TXN: ${txn}</p>
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running 🚀"));
