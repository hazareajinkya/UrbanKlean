export const generateInvitationEmail = (
  workspaceName: string,
  inviterName: string,
  invitationLink: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're invited to join ${workspaceName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            margin: 30px 0;
        }
        .workspace-info {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .workspace-name {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }
        .inviter {
            color: #6b7280;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MC</div>
            <h1 class="title">You're invited!</h1>
            <p class="subtitle">Join your team on Magical CX</p>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p><strong>${inviterName}</strong> has invited you to collaborate on their workspace.</p>
            
            <div class="workspace-info">
                <div class="workspace-name">${workspaceName}</div>
                <div class="inviter">Invited by ${inviterName}</div>
            </div>
            
            <p>Magical CX is a powerful platform for building AI-powered customer experiences. You'll be able to:</p>
            <ul>
                <li>Create and manage AI agents</li>
                <li>Set up communication channels</li>
                <li>Build knowledge bases</li>
                <li>Monitor conversations and analytics</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="${invitationLink}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="security-note">
                <strong>Security Note:</strong> This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${invitationLink}</p>
        </div>
        
        <div class="footer">
            <p>This invitation was sent by Magical CX. If you have any questions, please contact your team administrator.</p>
            <p style="margin-top: 10px;">
                <a href="#" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
                <a href="#" style="color: #6b7280; text-decoration: none;">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
  `.trim();
};
