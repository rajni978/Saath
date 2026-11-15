const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.log('[EMAIL MOCK]', { to, subject, text });
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: '"Saath Care" <' + user + '>',
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
