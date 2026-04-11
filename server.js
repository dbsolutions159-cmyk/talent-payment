require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

// MAIN API
app.post("/pay", async (req, res) => {

  const { name, email, txn, amount } = req.body;

  console.log("Data:", req.body);

  // तुरंत response
  res.json({ success: true });

  // 🔥 EMAIL SEND
  try {
    await transporter.sendMail({
      from: `"Talent OS" <${process.env.EMAIL}>`,
      to: email,
      subject: "Payment Confirmation - Talent OS",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Payment Successful ✅</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Amount:</b> ₹${amount}</p>
          <p><b>Transaction ID:</b> ${txn}</p>
          <br>
          <p>Thank you for choosing <b>Talent OS powered by DB Solutions</b></p>
        </div>
      `
    });

    console.log("Email sent ✅");

  } catch (err) {
    console.log("Email error ❌", err);
  }

});

app.listen(5000, () => console.log("Server running 🚀"));
