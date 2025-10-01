const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies for API requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Contact form endpoint
 * Expects JSON body: { name, email, subject, message }
 * Sends one email to site owner and an auto-reply to the sender.
 */
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body || {};
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ ok: false, error: 'Missing required fields' });
        }

        const fromEmail = process.env.MAIL_FROM; // your Gmail address
        const appPassword = process.env.MAIL_PASS; // Gmail App Password
        const toEmail = process.env.MAIL_TO || fromEmail; // destination (your inbox)

        if (!fromEmail || !appPassword) {
            return res.status(500).json({ ok: false, error: 'Email is not configured on server' });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: fromEmail,
                pass: appPassword,
            },
        });

        // Owner notification
        const ownerMail = {
            from: fromEmail,
            to: toEmail,
            subject: `[Portfolio Contact] ${subject}`,
            replyTo: email,
            text: `New message from ${name} <${email}>\n\n${message}`,
            html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><p>${message.replace(/\n/g, '<br>')}</p>`,
        };

        // Auto-reply to sender
        const autorespondMail = {
            from: fromEmail,
            to: email,
            subject: 'Thanks for reaching out!',
            text: `Hey ${name},\n\nThanks for contacting me! I appreciate you taking the time to reach out.\n\nI've received your message and will get back to you within 24-48 hours. In the meantime, feel free to check out my latest projects on GitHub or connect with me on LinkedIn.\n\nLooking forward to our conversation!\n\nBest regards,\nYanbo Zhao\nData Science Student & Software Engineer`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px; font-weight: 600;">Hey ${name},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin-bottom: 16px; font-size: 16px;">
                            Thanks for contacting me! I appreciate you taking the time to reach out.
                        </p>
                        
                        <p style="color: #475569; line-height: 1.6; margin-bottom: 16px; font-size: 16px;">
                            I've received your message and will get back to you within <strong>24-48 hours</strong>. In the meantime, feel free to check out my latest projects on 
                            <a href="https://github.com/RanboZhao" style="color: #3b82f6; text-decoration: none;">GitHub</a> or connect with me on 
                            <a href="https://www.linkedin.com/in/yanbo-zhao716" style="color: #3b82f6; text-decoration: none;">LinkedIn</a>.
                        </p>
                        
                        <p style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                            Looking forward to our conversation!
                        </p>
                        
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px;">
                            <p style="color: #1e293b; margin-bottom: 4px; font-size: 16px; font-weight: 600;">Best regards,</p>
                            <p style="color: #3b82f6; margin-bottom: 2px; font-size: 18px; font-weight: 700;">Yanbo Zhao</p>
                            <p style="color: #64748b; margin: 0; font-size: 14px; font-style: italic;">Data Science Student & Software Engineer</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            This is an automated response. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(ownerMail);
        await transporter.sendMail(autorespondMail);

        return res.json({ ok: true });
    } catch (err) {
        console.error('Contact error:', err);
        return res.status(500).json({ ok: false, error: 'Failed to send email' });
    }
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
});
