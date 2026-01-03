const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use a test account or configure with real SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send password reset email with both link and OTP
const sendPasswordResetEmail = async (email, resetToken, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Glamouré" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Glamouré',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .otp-box {
              background: #f5f5f5;
              border: 2px dashed #1a1a1a;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: 700;
              color: #1a1a1a;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .divider {
              text-align: center;
              margin: 30px 0;
              color: #999;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: #1a1a1a;
              color: #ffffff;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 40px;
              font-weight: 500;
              margin: 10px 0;
            }
            .button-container {
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .expiry {
              color: #dc3545;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Glamouré</div>
              <div class="title">Password Reset Request</div>
            </div>
            
            <div class="content">
              <p>Hi ${userName || 'there'},</p>
              <p>We received a request to reset your password. You can reset your password using either of the two methods below:</p>
            </div>
            
            <div class="otp-box">
              <div class="otp-label">OPTION 1: Enter this OTP code</div>
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                Valid for <span class="expiry">1 hour</span>
              </p>
            </div>
            
            <div class="divider">
              ──────── OR ────────
            </div>
            
            <div class="button-container">
              <p style="margin-bottom: 15px; color: #666;">OPTION 2: Click the button below</p>
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This OTP and link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share your OTP with anyone</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated email from Glamouré. Please do not reply.</p>
              <p style="margin-top: 10px;">© ${new Date().getFullYear()} Glamouré. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Glamouré
        
        Hi ${userName || 'there'},
        
        We received a request to reset your password. You can reset your password using either of the two methods below:
        
        OPTION 1: Enter this OTP code
        ${otp}
        (Valid for 1 hour)
        
        OR
        
        OPTION 2: Click this link
        ${resetLink}
        
        Security Notice:
        - This OTP and link will expire in 1 hour
        - If you didn't request this, please ignore this email
        - Never share your OTP with anyone
        
        © ${new Date().getFullYear()} Glamouré. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendPasswordResetEmail,
};
