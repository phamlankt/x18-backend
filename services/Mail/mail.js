import nodemailer from "nodemailer";
import { env } from "../../globals/config.js";

export const sendMail = async (email, mailTitle, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_ADDRESS,
      pass: env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: env.EMAIL_ADDRESS,
    to: email,
    subject: mailTitle,
    text: text,
  };

  transporter.sendMail(mailOptions);
};
