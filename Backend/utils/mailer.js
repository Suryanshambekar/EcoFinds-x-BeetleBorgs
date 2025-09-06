// utils/mailer.js
const nodemailer = require('nodemailer');

async function createTransporter() {
  // Production SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Development fallback: Ethereal (test SMTP)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

async function sendOtpEmail(email, otp) {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: `"EcoFinds" <no-reply@ecofinds.example>`,
    to: email,
    subject: 'Your EcoFinds login OTP',
    text: `Your EcoFinds login code is ${otp}. It is valid for 5 minutes.`,
    html: `<p>Your EcoFinds login code is <b>${otp}</b>. It is valid for 5 minutes.</p>`
  });

  // For Ethereal returns a preview URL you can open in browser
  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { messageId: info.messageId, previewUrl };
}

module.exports = { sendOtpEmail };
