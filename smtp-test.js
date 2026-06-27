/**
 * Minimal SMTP Test Script
 * 
 * This script tests Gmail SMTP connectivity using ONLY Nodemailer.
 * No project code, no settings service, no templates, no wrappers.
 * 
 * Usage:
 *   node smtp-test.js
 * 
 * Replace the credentials below with your actual Gmail App Password.
 */

import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

// Gmail SMTP Configuration
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL for port 465
  family: 4, // Force IPv4
  auth: {
    user: 'ewf.exprogroup.bd@gmail.com',
    pass: 'YOUR_GMAIL_APP_PASSWORD_HERE', // REPLACE THIS
    method: 'LOGIN',
  },
  tls: {
    minVersion: 'TLSv1.2',
    servername: 'smtp.gmail.com',
    rejectUnauthorized: true,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
};

const TEST_EMAIL = 'sadikwebdeveloper@gmail.com';

console.log('='.repeat(60));
console.log('MINIMAL SMTP TEST - Gmail');
console.log('='.repeat(60));
console.log('');
console.log('Configuration:');
console.log(`  Host: ${SMTP_CONFIG.host}`);
console.log(`  Port: ${SMTP_CONFIG.port}`);
console.log(`  Secure: ${SMTP_CONFIG.secure}`);
console.log(`  Family: ${SMTP_CONFIG.family} (IPv4)`);
console.log(`  Auth Method: ${SMTP_CONFIG.auth.method}`);
console.log(`  TLS Min Version: ${SMTP_CONFIG.tls.minVersion}`);
console.log(`  Username: ${SMTP_CONFIG.auth.user}`);
console.log(`  Password Length: ${SMTP_CONFIG.auth.pass.length}`);
console.log('');

if (SMTP_CONFIG.auth.pass === 'YOUR_GMAIL_APP_PASSWORD_HERE') {
  console.error('ERROR: Please replace YOUR_GMAIL_APP_PASSWORD_HERE with your actual Gmail App Password');
  process.exit(1);
}

async function testSmtp() {
  try {
    // Step 1: DNS Resolution
    console.log('Step 1: Resolving DNS...');
    const addresses = await dns.promises.resolve4(SMTP_CONFIG.host);
    console.log(`  ✓ Resolved to IPv4: ${addresses.join(', ')}`);
    console.log('');

    // Step 2: Create Transporter
    console.log('Step 2: Creating Nodemailer transporter...');
    const transporter = nodemailer.createTransport(SMTP_CONFIG);
    console.log('  ✓ Transporter created');
    console.log('');

    // Step 3: Verify Connection
    console.log('Step 3: Verifying SMTP connection...');
    await transporter.verify();
    console.log('  ✓ SMTP connection verified successfully');
    console.log('');

    // Step 4: Send Test Email
    console.log(`Step 4: Sending test email to ${TEST_EMAIL}...`);
    const info = await transporter.sendMail({
      from: `"Expro Group Test" <${SMTP_CONFIG.auth.user}>`,
      to: TEST_EMAIL,
      subject: 'SMTP Test - Expro Group',
      text: 'This is a test email from the minimal SMTP test script.',
      html: '<p>This is a <strong>test email</strong> from the minimal SMTP test script.</p>',
    });
    console.log('  ✓ Email sent successfully');
    console.log(`  Message ID: ${info.messageId}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('SUCCESS: All SMTP tests passed!');
    console.log('='.repeat(60));
    console.log('');
    console.log('If this test succeeded, the issue is in the Expro project code.');
    console.log('If this test failed, the issue is with Gmail credentials or network.');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('ERROR: SMTP test failed');
    console.error('='.repeat(60));
    console.error('');
    console.error('Error Details:');
    console.error(`  Code: ${error.code}`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Command: ${error.command}`);
    console.error(`  Response: ${error.response}`);
    console.error('');
    console.error('Full Error:');
    console.error(error);
    
    process.exit(1);
  }
}

testSmtp();
