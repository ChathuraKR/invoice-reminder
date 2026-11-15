import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(subject: string, html: string) {
  const { error } = await resend.emails.send({
    from: process.env.REMINDER_EMAIL_FROM!,
    to: process.env.REMINDER_EMAIL_TO!,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}