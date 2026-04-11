require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

app.post("/pay", async (req, res) => {

  const { name, email, phone, txn, amount } = req.body;

  res.json({ success: true });

  // EMAIL
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Payment Receipt",
      html: `
        <h2>Payment Slip</h2>
        <p>Name: ${name}</p>
        <p>Amount: ₹${amount}</p>
        <p>Txn: ${txn}</p>
        <p>Status: Success</p>
      `
    });

    console.log("Email sent");

  } catch (err) {
    console.log(err);
  }

  // WhatsApp redirect message (manual)
  console.log("Send WhatsApp to:", phone);

});

app.listen(5000);
