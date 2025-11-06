import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    console.warn("Email transporter not configured. Email not sent.");
    return { success: false, error: "Email not configured" };
  }

  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@buildmyagent.io",
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
