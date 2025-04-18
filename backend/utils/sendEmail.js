const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.SMTP_EMAIL}>`, // Use SMTP_EMAIL instead of FROM_EMAIL
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    // Verify transporter configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Send email
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Detailed email error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail; 