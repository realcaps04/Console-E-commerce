import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`Email skipped (no SMTP config): ${subject} -> ${to}`);
    return { success: true, skipped: true };
  }

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Console Ecommerce'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #2563EB; font-size: 24px;">Console Ecommerce</h1>
      <p style="color: #111827; font-size: 16px;">You requested a password reset.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset Password</a>
      <p style="color: #6B7280; font-size: 14px;">This link expires in 10 minutes.</p>
      <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset - Console Ecommerce',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
};

export const sendContactNotification = async (contact) => {
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #2563EB;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
    </div>
  `;

  if (process.env.SMTP_EMAIL) {
    return sendEmail({
      to: process.env.SMTP_EMAIL,
      subject: `Contact: ${contact.subject}`,
      html,
    });
  }
  return { success: true, skipped: true };
};

export default { sendEmail, sendPasswordResetEmail, sendContactNotification };
