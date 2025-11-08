const nodemailer = require('nodemailer');
const config = require('../config');
const emailTemplates = require('./emailTemplates');

let transport;
function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.auth.smtp.host,
      port: config.auth.smtp.port,
      secure: config.auth.smtp.secure,
      auth: config.auth.smtp.user
        ? { user: config.auth.smtp.user, pass: config.auth.smtp.pass }
        : undefined
    });
  }
  return transport;
}

function renderTemplate(name, locals) {
  return emailTemplates.render(name, locals);
}

class MailerService {
  async sendTemplate(to, subject, templateName, locals) {
    const html = renderTemplate(templateName, locals);
    const transporter = getTransport();
    if (!config.auth.smtp.host) {
      console.warn('SMTP not configured; email skipped');
      return { skipped: true };
    }
    const info = await transporter.sendMail({
      from: config.auth.smtp.from,
      to,
      subject,
      html
    });
    return { messageId: info.messageId };
  }
}

module.exports = new MailerService();
