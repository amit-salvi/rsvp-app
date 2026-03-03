import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { to, subject, text } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.example.com", // e.g., smtp.gmail.com
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: '"RSVP App" <no-reply@example.com>',
      to,
      subject,
      text,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}