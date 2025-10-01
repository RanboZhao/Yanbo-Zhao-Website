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
            subject: 'Thanks for contacting me!',
            text: `Thanks for contacting me! I will get back to you soon!\n\nBest,\nYanbo`,
            html: `<p>Thanks for contacting me! I will get back to you soon!</p><p>Best,<br>Yanbo</p>`,
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
