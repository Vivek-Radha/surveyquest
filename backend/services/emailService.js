import nodemailer from 'nodemailer';

// Mocks a transport safely without requiring real SMTP for local development
let testAccount;
let transporter;

const initializeTransporter = async () => {
    if (transporter) return;
    try {
        testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`[Email Service] Ethereal Automated Mailer Initialized: ${testAccount.user}`);
    } catch (err) {
        console.error("Failed to initialize mailer", err);
    }
};

const sendGenericEmail = async (to, subject, htmlContent) => {
    try {
        await initializeTransporter();
        const info = await transporter.sendMail({
            from: '"Survey Quest Automation" <noreply@surveyquest.io>',
            to: to,
            subject: subject,
            html: htmlContent,
        });
        
        console.log(`\n================= EMAIL LOG =================`);
        console.log(`✅ Automated Email dynamically dispatched to: ${to}`);
        console.log(`📌 Subject: ${subject}`);
        console.log(`🔗 Preview Mock Receipt Online: ${nodemailer.getTestMessageUrl(info)}`);
        console.log(`=============================================\n`);
        return true;
    } catch (err) {
        console.log(`Email mock failed to send to ${to}: ${err.message}`);
        return false;
    }
}

export const emailService = {
    // 1. Signup Dispatch
    sendWelcomeEmail: async (email, name) => {
        const html = `
            <div style="font-family: inherit; background: #f8fafc; padding: 40px; border-radius: 10px;">
                <h1 style="color: #4f46e5;">Welcome to Survey Quest, ${name}!</h1>
                <p style="color: #475569; font-size: 16px;">
                    Thank you for registering. You now have full access to our enterprise-grade 
                    data collection tools. Feel free to build your first interactive campaign now.
                </p>
                <div style="margin-top: 30px; font-size: 13px; color: #94a3b8;">
                    This is an automated formal receipt.
                </div>
            </div>
        `;
        return sendGenericEmail(email, "Welcome to Survey Quest! 🎉", html);
    },

    // 2. Login Alert Dispatch
    sendLoginAlert: async (email) => {
        const html = `
            <div style="font-family: inherit; background: #fff; padding: 20px; border-left: 4px solid #10b981;">
                <h2 style="color: #10b981; margin-top: 0;">Login Registered Securly</h2>
                <p style="color: #334155;">Hello, a seamless login was successfully instantiated on your Survey Quest profile linked to ${email}.</p>
            </div>
        `;
        return sendGenericEmail(email, "New Login Detected 🔐", html);
    },

    // 3. Survey Created Alert
    sendSurveyCreated: async (email, surveyTitle) => {
        const html = `
             <div style="font-family: inherit; padding: 20px; background: #eef2ff; border-radius: 8px;">
                <h2 style="color: #4338ca;">Campaign Successfully Published! 🚀</h2>
                <p style="color: #312e81;">Your survey "<b>${surveyTitle}</b>" is live and actively ready to farm responses!</p>
             </div>
        `;
        return sendGenericEmail(email, "Your Survey Quest Campaign is Live!", html);
    },

    // 4. Response Received Alert
    sendResponseAlert: async (adminEmail, surveyTitle) => {
        const html = `
             <div style="font-family: inherit; padding: 20px; text-align: center; background: #0f172a;">
                <h2 style="color: #60a5fa;">New Response Caught ⚡</h2>
                <p style="color: #cbd5e1;">A new user has dynamically filled out "<b>${surveyTitle}</b>" in real-time!</p>
             </div>
        `;
        return sendGenericEmail(adminEmail, "New Response Data Logged!", html);
    }
};
