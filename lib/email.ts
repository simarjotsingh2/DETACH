import nodemailer from 'nodemailer'

/**
 * Send OTP email to user
 */
export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    })

    const mailOptions = {
      from: {
        name: 'ROT KIT',
        address: process.env.EMAIL_USER || 'noreply@rotkit.com'
      },
      to: email,
      subject: 'Verify Your Email - ROT KIT Registration',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - ROT KIT</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
            }
            .otp-container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
            }
            .message {
              font-size: 16px;
              margin-bottom: 20px;
              line-height: 1.5;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ROT KIT</div>
              <div class="subtitle">Fashion & Lifestyle</div>
            </div>
            
            <div class="message">
              <p>Hello${name ? ` ${name}` : ''},</p>
              <p>Welcome to ROT KIT! To complete your registration, please verify your email address using the OTP code below:</p>
            </div>
            
            <div class="otp-container">
              <div>Your Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div>This code will expire in 5 minutes</div>
            </div>
            
            <div class="message">
              <p>Enter this code on the registration page to verify your email and complete your account setup.</p>
            </div>
            
            <div class="warning">
              <strong>Security Note:</strong> Never share this code with anyone. ROT KIT will never ask for your verification code via phone or email.
            </div>
            
            <div class="footer">
              <p>If you didn't request this verification, please ignore this email.</p>
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; 2024 ROT KIT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        ROT KIT - Email Verification
        
        Hello${name ? ` ${name}` : ''},
        
        Welcome to ROT KIT! To complete your registration, please verify your email address using the OTP code below:
        
        Verification Code: ${otp}
        
        This code will expire in 5 minutes.
        
        Enter this code on the registration page to verify your email and complete your account setup.
        
        If you didn't request this verification, please ignore this email.
        
        © 2024 ROT KIT. All rights reserved.
      `
    }

    await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      message: 'OTP sent successfully to your email address.'
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return {
      success: false,
      message: 'Failed to send OTP email. Please try again later.'
    }
  }
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    })

    const mailOptions = {
      from: {
        name: 'ROT KIT',
        address: process.env.EMAIL_USER || 'noreply@rotkit.com'
      },
      to: email,
      subject: 'Welcome to ROT KIT - Registration Successful!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ROT KIT</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 10px;
            }
            .welcome-message {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ROT KIT</div>
            </div>
            
            <div class="welcome-message">
              <h2>Welcome to ROT KIT, ${name}! 🎉</h2>
              <p>Your account has been successfully created and verified.</p>
            </div>
            
            <div style="text-align: center;">
              <p>Thank you for joining ROT KIT! You can now explore our latest fashion collections and start shopping.</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://edgyfashion.vercel.app' : 'http://localhost:3000')}/shop" class="button">Start Shopping</a>
            </div>
            
            <div class="footer">
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>&copy; 2024 ROT KIT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      message: 'Welcome email sent successfully.'
    }
  } catch (error) {
    console.error('Welcome email sending error:', error)
    return {
      success: false,
      message: 'Failed to send welcome email.'
    }
  }
}

/**
 * Send order confirmation email after successful purchase
 */
export async function sendOrderConfirmationEmail(params: {
  email: string
  name: string
  orderId: string
  items: Array<{
    name: string
    imageUrl: string
    quantity: number
    price: number
    size?: string
  }>
  totalPrice: number
  estimatedDelivery: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://edgyfashion.vercel.app' : 'http://localhost:3000')

    const itemsHtml = params.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <img src="${item.imageUrl}" alt="${item.name}" width="56" height="56" style="border-radius: 6px; object-fit: cover; vertical-align: middle; margin-right: 10px;">
          <span style="font-weight: 600; color: #111827;">${item.name}</span>
          ${item.size ? `<div style=\"color:#6b7280; font-size:12px;\">Size: ${item.size}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color:#374151;">x${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:right; font-weight:600; color:#111827;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    const mailOptions = {
      from: {
        name: 'ROT KIT',
        address: process.env.EMAIL_USER || 'noreply@rotkit.com'
      },
      to: params.email,
      subject: `Your ROT KIT order is confirmed • #${params.orderId}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#f3f4f6; padding:24px;">
          <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="background:#111827; color:#fff; padding:24px; text-align:center;">
              <div style="display:inline-block; background:#10b981; width:40px; height:40px; border-radius:9999px; line-height:40px;">✔</div>
              <h1 style="margin:12px 0 0; font-size:22px; color:#ffffff;">Order Confirmed!</h1>
              <p style="margin:8px 0 0; color:#d1d5db;">Thanks ${params.name}, your order has been placed.</p>
            </div>
            <div style="padding:24px;">
              <p style="margin:0 0 8px; color:#374151;">Order #: <strong>ROT-${params.orderId}</strong></p>
              <p style="margin:0 0 16px; color:#374151;">Estimated delivery by <strong>${params.estimatedDelivery}</strong></p>
              <table style="width:100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align:left; padding:12px; color:#6b7280; font-weight:600;">Item</th>
                    <th style="text-align:left; padding:12px; color:#6b7280; font-weight:600;">Qty</th>
                    <th style="text-align:right; padding:12px; color:#6b7280; font-weight:600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td style="padding:12px; text-align:right; color:#374151; font-weight:600;">Total</td>
                    <td style="padding:12px; text-align:right; font-weight:800; color:#111827;">₹${params.totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <div style="text-align:center; margin-top:24px;">
                <a href="${baseUrl}/user/dashboard" style="display:inline-block; background:#ef4444; color:#fff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:700;">View Orders</a>
              </div>
            </div>
            <div style="padding:16px; background:#f9fafb; color:#6b7280; text-align:center; font-size:12px;">© 2025 ROT KIT. All rights reserved.</div>
          </div>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)

    return { success: true, message: 'Order confirmation email sent.' }
  } catch (error) {
    console.error('Order confirmation email error:', error)
    return { success: false, message: 'Failed to send order confirmation email.' }
  }
}
