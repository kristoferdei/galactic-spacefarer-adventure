import nodemailer from 'nodemailer';

function createTransport() {
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined
        });
    }

    return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = createTransport();
const isLiveTransport = Boolean(process.env.SMTP_HOST);

export async function sendWelcomeEmail(spacefarer) {
    const name = spacefarer?.name || 'spacefarer';
    const to =
        spacefarer?.email ||
        `${name.toLowerCase().replace(/\s+/g, '.')}@galactic-spacefarers.example`;

    const mail = {
        from: process.env.MAIL_FROM || '"Galactic Spacefarer Adventure" <no-reply@galactic-spacefarers.example>',
        to,
        subject: `Welcome aboard, ${name}!`,
        text: `Congratulations, ${name}! Your journey among the stars begins now. Origin planet: ${spacefarer?.originPlanet || 'unknown'}.`,
        html: `<p>Congratulations, <strong>${name}</strong>! Your journey among the stars begins now.</p><p>Origin planet: ${spacefarer?.originPlanet || 'unknown'}</p>`
    };

    const info = await transporter.sendMail(mail);

    if (isLiveTransport) {
        console.log(`Welcome email sent to ${to} (messageId: ${info.messageId})`);
    } else {
        console.log(`[dev mailer, no SMTP configured] Would send welcome email to ${to}`);
    }

    return info;
}