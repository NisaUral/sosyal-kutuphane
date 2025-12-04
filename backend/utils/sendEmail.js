const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('--- .env DEĞİŞKEN KONTROLÜ ---');
  console.log('HOST:', process.env.EMAIL_HOST);
  console.log('USER:', process.env.EMAIL_USER);
  console.log('PASS VAR MI?:', !!process.env.EMAIL_PASS);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587, // veya 465
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.EMAIL_USER} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: `<p>${options.message}</p>` 
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email gönderildi:', info.messageId);
  } catch (error) {
    console.error('Email gönderme hatası:', error);
  }
};

module.exports = sendEmail;