const sgMail = require('@sendgrid/mail');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('✅ SendGrid is configured.');

// Get the sender email (must be a verified sender in SendGrid)
const getSenderEmail = () => {
  return process.env.EMAIL_USER;
};

// Get the sender name
const getSenderName = () => {
  return 'SportsClub';
};

/**
 * Sends a verification email with OTP using SendGrid
 */
const sendVerificationEmail = async (email, otp) => {
  const senderEmail = getSenderEmail();
  const senderName = getSenderName();

  if (!process.env.SENDGRID_API_KEY || !senderEmail) {
    console.error('❌ SendGrid API Key or Sender Email is not configured.');
    return false;
  }

  const msg = {
    to: email,
    from: {
      name: senderName,
      email: senderEmail,
    },
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to SportsClub!</h2>
        <p>Thank you for signing up. Please verify your email address by entering the following OTP in the app:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The SportsClub Team</p>
      </div>
    `,
  };

  try {
    console.log(`📨 Sending verification email to ${email} via SendGrid...`);
    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid send error:', error.toString());
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
};
