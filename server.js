require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const nodemailer = require("nodemailer");

const app = express();

/* ================= CONFIG ================= */

const PORT = process.env.PORT || 5000;

// ✅ FIXED PATH (IMPORTANT)
const PUBLIC_PATH = path.join(__dirname, "public");

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(morgan("dev"));

/* ================= FRONTEND ================= */

// static serve
app.use(express.static(PUBLIC_PATH));

// force index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, "index.html"));
});

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= PAYMENT API ================= */

app.post("/pay", async (req, res) => {
  try {
    const { name, email, txn, amount } = req.body;

    if (!name || !email || !txn || !amount) {
      return res.status(400).json({
        success: false,
        error: "All fields required",
      });
    }

    console.log("💰 Payment:", { name, email, txn, amount });

    const receiptHTML = `
    <div style="font-family:Arial;padding:25px;">
      <h2 style="color:#22c55e;">Payment Successful ✅</h2>
      <p>Hi <b>${name}</b>,</p>

      <table>
        <tr><td><b>Amount:</b></td><td>₹${amount}</td></tr>
        <tr><td><b>TXN:</b></td><td>${txn}</td></tr>
      </table>

      <br/>

      <div style="background:#0f172a;color:white;padding:15px;border-radius:10px;">
        <h3>Talent O-S</h3>
        <p>Powered by DB Solutions</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: `"Talent OS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Payment Confirmed",
      html: receiptHTML,
    });

    const whatsappLink = `https://wa.me/91${process.env.ADMIN_NUMBER}?text=Payment Done - ${name} - ₹${amount}`;

    res.json({
      success: true,
      whatsapp: whatsappLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* ================= HEALTH ================= */

app.get("/api/health", (req, res) => {
  res.json({ success: true });
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
