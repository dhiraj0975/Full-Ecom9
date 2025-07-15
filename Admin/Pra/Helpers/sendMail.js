const nodemailer = require('nodemailer');

// Yeh function email bhejta hai
async function sendMail(to, subject, htmlBody) {
  // Apne email aur app password yahan set karein
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // .env mein EMAIL_USER
      pass: process.env.EMAIL_PASS  // .env mein EMAIL_PASS (App Password)
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlBody
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendMail; 