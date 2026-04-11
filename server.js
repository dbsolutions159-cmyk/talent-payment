require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

// ✅ Test route (optional)
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ Payment API
app.post("/pay", async (req, res) => {
  try {
    const { name, email, txn, amount } = req.body;

    console.log("Incoming Data:", req.body);

    if (!name || !email || !txn || !amount) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // 🔹 Save to Supabase
    const { error } = await supabase
      .from("payments")
      .insert([
        {
          name,
          email,
          txn,
          amount,
          status: "pending"
        }
      ]);

    if (error) {
      console.log("Supabase Error:", error);
      return res.json({ success: false });
    }

    // 🔹 Send Email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Payment Confirmation - Talent OS",
      html: `
        <h2>Talent OS</h2>
        <p>Hi ${name},</p>
        <p>Your payment has been received.</p>
        <p><b>Amount:</b> ₹${amount}</p>
        <p><b>Transaction ID:</b> ${txn}</p>
        <p>Status: Pending Verification</p>
        <br/>
        <p>Thank you!</p>
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.log("Server Error:", err);
    res.json({ success: false });
  }
});

// ✅ IMPORTANT (Render port fix)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
