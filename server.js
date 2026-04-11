require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

// API
app.post("/send", async (req, res) => {

  const { name, email, txn, amount } = req.body;

  const html = `
  <div style="font-family:Arial; padding:20px; border:1px solid #ddd;">

    <h2 style="color:#2563eb;">Talent O-S</h2>
    <p><b>Powered by DB Solutions</b></p>

    <hr/>

    <h3>Payment Receipt</h3>

    <p><b>Name:</b> ${name}</p>
    <p><b>Amount:</b> ₹${amount}</p>
    <p><b>Transaction ID:</b> ${txn}</p>
    <p><b>Status:</b> Success</p>

    <hr/>

    <p>Thank you for choosing Talent OS.</p>
    <p>This is a system generated receipt.</p>

  </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Payment Confirmation - Talent OS",
      html: html
    });

    res.send("Email Sent");
  } catch (err) {
    console.log(err);
    res.send("Error sending email");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});