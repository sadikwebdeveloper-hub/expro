const baseTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:28px 32px;color:#fff;">
          <h1 style="margin:0;font-size:24px;">Expro Group</h1>
          <p style="margin:8px 0 0;opacity:0.9;font-size:14px;">${title}</p>
        </td></tr>
        <tr><td style="padding:32px;color:#374151;line-height:1.6;">${body}</td></tr>
        <tr><td style="padding:20px 32px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
          © ${new Date().getFullYear()} Expro Group. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const templates = {
  otp: (otp, purpose) =>
    baseTemplate(
      purpose === 'reset' ? 'Password Reset Code' : 'Verification Code',
      `<p>Your ${purpose === 'reset' ? 'password reset' : 'verification'} code is:</p>
       <p style="font-size:36px;font-weight:bold;letter-spacing:6px;color:#1e40af;text-align:center;margin:24px 0;">${otp}</p>
       <p>This code expires in <strong>5 minutes</strong>.</p>
       <p style="color:#6b7280;font-size:13px;">If you did not request this, please ignore this email.</p>`
    ),

  contactForm: ({ name, email, subject, message, date }) =>
    baseTemplate(
      'New Contact Form Message',
      `<p><strong>From:</strong> ${name} (${email})</p>
       <p><strong>Subject:</strong> ${subject}</p>
       <p><strong>Date:</strong> ${date}</p>
       <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
       <p style="white-space:pre-wrap;">${message}</p>`
    ),

  adminInvitation: ({ fullName, username, tempPassword, loginUrl }) =>
    baseTemplate(
      'Admin Account Invitation',
      `<p>Hello <strong>${fullName}</strong>,</p>
       <p>You have been invited to the Expro Group Admin Panel.</p>
       <table style="width:100%;background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
         <tr><td><strong>Username:</strong> ${username}</td></tr>
         <tr><td><strong>Temporary Password:</strong> <code style="background:#e5e7eb;padding:4px 8px;border-radius:4px;">${tempPassword}</code></td></tr>
       </table>
       <p>Please log in and change your password immediately.</p>
       <p style="text-align:center;margin-top:24px;">
         <a href="${loginUrl}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Login to Admin Panel</a>
       </p>`
    ),

  welcome: ({ fullName }) =>
    baseTemplate(
      'Welcome to Expro Group Admin',
      `<p>Hello <strong>${fullName}</strong>,</p>
       <p>Your admin account has been created successfully. Welcome to the Expro Group management team.</p>`
    ),

  smtpTest: () =>
    baseTemplate(
      'SMTP Test Successful',
      `<p style="text-align:center;font-size:18px;color:#059669;">✓ SMTP Connected Successfully</p>
       <p>This is a test email from your Expro Group admin panel. Your SMTP configuration is working correctly.</p>`
    ),

  contactConfirmation: ({ name, subject }) =>
    baseTemplate(
      'Message Received',
      `<p>Hi <strong>${name}</strong>,</p>
       <p>Thank you for contacting Expro Group. We have received your message regarding <strong>${subject}</strong>.</p>
       <p>Our team will review it and respond as soon as possible.</p>
       <p style="color:#6b7280;font-size:13px;">This is an automated confirmation. Please do not reply to this email.</p>`
    ),

  passwordResetSuccess: ({ fullName }) =>
    baseTemplate(
      'Password Reset Successful',
      `<p>Hello <strong>${fullName}</strong>,</p>
       <p>Your password has been reset successfully. If you did not perform this action, contact your administrator immediately.</p>`
    ),
};

export default templates;
