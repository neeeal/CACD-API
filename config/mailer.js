const nodemailer = require("nodemailer");

// Email sender initialization
var transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE,
  auth: {
    user: process.env.MAIL_EMAIL,
    pass: process.env.MAIL_APP_PASSWORD
  }
});

module.exports = transporter;