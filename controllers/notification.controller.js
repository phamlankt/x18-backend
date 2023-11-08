import asyncHandler from "express-async-handler";
import { RESPONSE } from "../globals/api.js";
import { ResponseFields } from "../globals/fields/response.js";
import {
  getNotificationByRecruiter,
  updateNotificationById,
} from "../services/mongo/notification.js";


const getByRecruiter = asyncHandler(async (req, res) => {
  const email = req.users.email;
  try {
    await getNotificationByRecruiter(email).then((result) => {
      res.send(
        RESPONSE(
          {
            [ResponseFields.notificationList]: result,
          },
          "Successfully"
        )
      );
    });
  } catch (e) {
    res.status(400).send(RESPONSE([], "Unsuccessful", e.error, e.message));
  }
});

const update = asyncHandler(async (req, res) => {
  const updatedNotification = await updateNotificationById(req);
  res.send(
    RESPONSE(
      {
        [ResponseFields.notificationInfo]: updatedNotification,
      },
      "Update notification successfully"
    )
  );
});

const NotificationController = {
  getByRecruiter,
  update,
};

export default NotificationController;
