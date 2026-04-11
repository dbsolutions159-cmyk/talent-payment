require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Supabase =====
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ===== Email =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

// ===== Health =====
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ===== API =====
app.post("/pay", async (req, res) => {
  const { name, email, txn, amount } = req.body;

  if (!name || !email || !txn || !amount) {
    return res.status(400).json({ success: false, msg: "Missing fields" });
  }

  console.log("📥 Incoming:", req.body);

  let dbStatus = "ok";
  let emailStatus = "ok";

  try {
    // 1) Save DB
    const { error } = await supabase
      .from("payments")
      .insert([{ name, email, txn, amount }]);

    if (error) {
      dbStatus = "fail";
      console.log("❌ Supabase error:", error);
    } else {
      console.log("✅ Saved to Supabase");
    }

    // 2) Send Email
    try {
      const info = await transporter.sendMail({
        from: `"Talent OS" <${process.env.EMAIL}>`,
        to: email,
        subject: "Payment Confirmation - Talent OS",
        html: `
          <div style="font-family:Arial;padding:20px">
            <h2>✅ Payment Received</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Amount:</b> ₹${amount}</p>
            <p><b>Transaction ID:</b> ${txn}</p>
            <hr/>
            <p>Talent OS powered by DB Solutions</p>
          </div>
        `
      });
      console.log("📧 Email sent:", info.response);
    } catch (e) {
      emailStatus = "fail";
      console.log("❌ Email error:", e);
    }

    return res.json({ success: true, db: dbStatus, email: emailStatus });

  } catch (err) {
    console.log("🔥 Server error:", err);
    return res.json({ success: false });
  }
});

// ===== Start =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on " + PORT));
