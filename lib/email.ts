import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: process.env.EMAIL_SERVER_PORT === "465",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  } else if (process.env.SENDGRID_API_KEY) {
    // SendGrid support
    transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Development: use Ethereal or console logging
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });
  }

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  const emailTransporter = getTransporter();
  const fromEmail = from || process.env.EMAIL_FROM || "noreply@buildmyagent.io";

  try {
    const info = await emailTransporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, ""),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
}
