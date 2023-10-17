import { RESPONSE } from "../globals/api.js";
import { env } from "../globals/config.js";
import { ResponseFields } from "../globals/fields/response.js";
import nodemailer from "nodemailer";
import { user_getByEmail, user_updateById } from "../services/mongo/users.js";
import { jwtSign } from "../globals/jwt.js";
import { MongoFields } from "../globals/fields/mongo.js";

export const send = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_ADDRESS,
      pass: env.EMAIL_PASSWORD,
    },
  });
  const { email } = req.body;
  const requestedUser = await user_getByEmail(email);
  if (!requestedUser)
    res.status(400).send(RESPONSE([], "Email does not exist!"));

  else {
    try {
      // send a link to resetpage with token as params
      const jwtPayload = {
        receivedEmail: email,
      };
      const token = jwtSign(jwtPayload, 60 * 24);
      const mailOptions = {
        from: env.EMAIL_ADDRESS,
        to: email,
        subject: "reset password",
        text: `Please click on the following link to reset your password ${env.BASE_URL_FRONTEND}/resetPassword/${token}. Link is valid for 24 hours`,
      };
      transporter.sendMail(mailOptions, async (e, info) => {
        if (e) {
          res
            .status(400)
            .send(RESPONSE([], "Unsuccessful", e.errors, e.message));
        } else {
          // set is_resetting_password=true
          await user_updateById({
            id: requestedUser[MongoFields.id],
            is_password_resetting: true,
          });
          res.send(
            RESPONSE(
              {
                [ResponseFields.message]: info.response,
              },
              "Email is sent successfully!"
            )
          );
        }
      });
    } catch (e) {
      res.status(400).send(RESPONSE([], "Unsuccessful", e.errors, e.message));
    }
  }
};

const MailController = {
  send,
};

export default MailController;
