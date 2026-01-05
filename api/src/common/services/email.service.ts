import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface OfficeCredentialsEmailData {
  officeName: string;
  officeEmail: string;
  username: string;
  password: string;
  loginUrl?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Email transporter initialized successfully');
    } else {
      this.logger.warn(
        'SMTP configuration missing. Emails will be logged to console instead.',
      );
    }
  }

  /**
   * Send office admin credentials email
   */
  async sendOfficeCredentialsEmail(
    data: OfficeCredentialsEmailData,
  ): Promise<boolean> {
    const { officeName, officeEmail, username, password, loginUrl } = data;

    const adminLoginUrl =
      loginUrl ||
      this.configService.get<string>('ADMIN_URL', 'http://localhost:3001') +
        '/login';
    const fromEmail = this.configService.get<string>(
      'SMTP_FROM',
      'noreply@sarkari-sewa.gov.np',
    );
    const fromName = this.configService.get<string>(
      'SMTP_FROM_NAME',
      'Sarkari Sewa Portal',
    );

    const emailContent = {
      from: `"${fromName}" <${fromEmail}>`,
      to: officeEmail,
      subject: `Office Admin Credentials - ${officeName}`,
      html: this.generateCredentialsEmailHtml({
        officeName,
        username,
        password,
        loginUrl: adminLoginUrl,
      }),
      text: this.generateCredentialsEmailText({
        officeName,
        username,
        password,
        loginUrl: adminLoginUrl,
      }),
    };

    // If transporter is not configured, log the email instead
    if (!this.transporter) {
      this.logger.log('='.repeat(60));
      this.logger.log('EMAIL WOULD BE SENT (SMTP not configured):');
      this.logger.log(`To: ${officeEmail}`);
      this.logger.log(`Subject: ${emailContent.subject}`);
      this.logger.log(`Office: ${officeName}`);
      this.logger.log(`Username: ${username}`);
      this.logger.log(`Password: ${password}`);
      this.logger.log(`Login URL: ${adminLoginUrl}`);
      this.logger.log('='.repeat(60));
      return true; // Return true for development
    }

    try {
      const info = await this.transporter.sendMail(emailContent);
      this.logger.log(
        `Credentials email sent to ${officeEmail}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send credentials email to ${officeEmail}:`,
        error,
      );
      return false;
    }
  }

  private generateCredentialsEmailHtml(data: {
    officeName: string;
    username: string;
    password: string;
    loginUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Office Admin Credentials</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🏛️ Setu - GSN</h1>
    <p style="color: #e0e7ff; margin: 10px 0 0 0;">Office Administration System</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1e40af; margin-top: 0;">Welcome, Office Administrator!</h2>
    
    <p>Your office <strong>${data.officeName}</strong> has been registered on the Setu - GSN platform. Below are your admin credentials to access the office dashboard.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
      <h3 style="color: #1e40af; margin-top: 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">🔐 Login Credentials</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Username:</td>
          <td style="padding: 10px 0;"><code style="background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">${data.username}</code></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Password:</td>
          <td style="padding: 10px 0;"><code style="background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">${data.password}</code></td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.loginUrl}" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <strong style="color: #92400e;">⚠️ Security Notice:</strong>
      <p style="margin: 10px 0 0 0; color: #92400e;">Please change your password immediately after your first login. Keep your credentials secure and do not share them with anyone.</p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="color: #64748b; font-size: 14px; text-align: center;">
      If you did not request this account, please contact the system administrator immediately.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Sarkari Sewa Portal. All rights reserved.</p>
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
    `.trim();
  }

  private generateCredentialsEmailText(data: {
    officeName: string;
    username: string;
    password: string;
    loginUrl: string;
  }): string {
    return `
SARKARI SEWA PORTAL - Office Admin Credentials
================================================

Welcome, Office Administrator!

Your office "${data.officeName}" has been registered on the Sarkari Sewa Portal.

LOGIN CREDENTIALS
-----------------
Username: ${data.username}
Password: ${data.password}

Login URL: ${data.loginUrl}

SECURITY NOTICE
---------------
Please change your password immediately after your first login.
Keep your credentials secure and do not share them with anyone.

If you did not request this account, please contact the system administrator immediately.

---
© ${new Date().getFullYear()} Sarkari Sewa Portal. All rights reserved.
This is an automated message. Please do not reply to this email.
    `.trim();
  }
}
