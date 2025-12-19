const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Always use Gmail SMTP for both development and production
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // IMPORTANT: Use Gmail App Password here
    }
  });
};

const transporter = createTransporter();

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email server connection failed:', error);
  } else {
    console.log('✅ Email server is ready (Gmail SMTP)');
  }
});

// Get the sender email
const getSenderEmail = () => {
  return process.env.EMAIL_USER;
};

// Get the sender name
const getSenderName = () => {
  return 'SportsClub';
};

/**
 * Sends a verification email with OTP
 */
const sendVerificationEmail = async (email, otp, attempt = 1, maxAttempts = 3) => {
  const senderEmail = getSenderEmail();
  const senderName = getSenderName();
  
  if (!senderEmail) {
    console.error('❌ No sender email configured');
    return false;
  }

  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`,
    to: email,
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
    console.log(`📨 Sending verification email to ${email} from ${senderEmail} (Attempt ${attempt}/${maxAttempts})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Message sent: %s', info.messageId);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Email send error (Attempt ${attempt}):`, {
      to: email,
      from: senderEmail,
      error: error.message,
      code: error.code,
      response: error.response
    });

    // If the error is about sender verification, don't retry
    if (error.message.includes('sender identity') || error.message.includes('550')) {
      console.error('❌ Sender email verification required. Please verify your sender email in SendGrid.');
      return false;
    }

    // Retry logic with exponential backoff
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`🔄 Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendVerificationEmail(email, otp, attempt + 1, maxAttempts);
    }

    console.error(`❌ Failed to send verification email to ${email} after ${maxAttempts} attempts`);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  getSenderEmail // Export for testing
};
