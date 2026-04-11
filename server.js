require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());

app.use(express.json());

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS, // App Password
  },
});

/* ================= ROUTES ================= */

// Health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// PAYMENT API
app.post("/pay", async (req, res) => {
  console.log("Incoming Request 🔥:", req.body);

  const { name, email, txn, amount } = req.body;

  try {
    /* ===== SAVE TO SUPABASE ===== */

    let dbStatus = "ok";

    const { error } = await supabase.from("payments").insert([
      {
        name,
        email,
        txn,
        amount,
        status: "success",
      },
    ]);

    if (error) {
      dbStatus = "fail";
      console.log("Supabase Error ❌:", error);
    } else {
      console.log("Saved in Supabase ✅");
    }

    /* ===== SEND EMAIL ===== */

    let emailStatus = "ok";

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Talent OS Payment Confirmed",
        html: `
          <h2>Payment Successful 🎉</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Amount:</b> ₹${amount}</p>
          <p><b>Transaction ID:</b> ${txn}</p>
          <br>
          <p>Thanks for joining Talent OS 🚀</p>
        `,
      });

      console.log("Email Sent ✅");

    } catch (mailErr) {
      emailStatus = "fail";
      console.log("Email Error ❌:", mailErr);
    }

    /* ===== FINAL RESPONSE ===== */

    res.json({
      success: true,
      db: dbStatus,
      email: emailStatus,
    });

  } catch (err) {
    console.log("Server Error ❌:", err);

    res.json({
      success: false,
      error: err.message,
    });
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
