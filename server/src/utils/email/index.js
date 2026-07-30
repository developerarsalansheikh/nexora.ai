import nodemailer from 'nodemailer';
import logger from '../logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@nexora.ai';

/**
 * Send email helper. Logs to console/logger if SMTP credentials are placeholder/empty.
 * @param {object} options - { to, subject, html, text }
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"Nexora.ai Support" <${EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };

  // Skip actual sending if email settings are placeholder defaults
  if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email@')) {
    logger.info(`📧 [DEV EMAIL SIMULATOR]`);
    logger.info(`To:      ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Text:    ${text}`);
    logger.info(`------------------------------------------`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    throw new Error('Email delivery failed. Please try again later.', { cause: error });
  }
};

/**
 * Send email verification link
 * @param {string} to
 * @param {string} name
 * @param {string} verifyUrl
 */
export const sendVerificationEmail = async (to, name, verifyUrl) => {
  const subject = 'Verify your email address — Nexora.ai';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eef2f6; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to Nexora.ai, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.5; color: #334155;">Please verify your email address to complete your registration and active your account.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="font-size: 14px; line-height: 1.5; color: #64748b;">Or copy and paste this URL into your browser:</p>
      <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #eef2f6; margin: 30px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link will expire in 24 hours. If you did not sign up for Nexora.ai, please ignore this email.</p>
    </div>
  `;
  const text = `Welcome to Nexora.ai, ${name}!\n\nPlease verify your email by opening the following link: ${verifyUrl}`;
  await sendEmail({ to, subject, html, text });
};

/**
 * Send password reset email
 * @param {string} to
 * @param {string} name
 * @param {string} resetUrl
 */
export const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const subject = 'Reset your password — Nexora.ai';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eef2f6; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="font-size: 16px; line-height: 1.5; color: #334155;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.5; color: #334155;">We received a request to reset your password for your Nexora.ai account. Click the button below to choose a new password.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; line-height: 1.5; color: #64748b;">Or copy and paste this URL into your browser:</p>
      <p style="font-size: 12px; color: #ef4444; word-break: break-all;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eef2f6; margin: 30px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link is valid for 1 hour. If you did not request this, please secure your account and ignore this email.</p>
    </div>
  `;
  const text = `Hi ${name},\n\nYou requested a password reset. Click this link to choose a new password: ${resetUrl}`;
  await sendEmail({ to, subject, html, text });
};
