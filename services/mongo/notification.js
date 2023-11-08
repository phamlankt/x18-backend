import expressAsyncHandler from "express-async-handler";
import { MongoFields } from "../../globals/fields/mongo.js";
import { NotificationModel } from "../../globals/mongodb.js";
import { getJobById } from "./jobs.js";
import { userGetByEmail } from "./users.js";
import asyncHandler from "express-async-handler";

export const getNotificationByRecruiter = async (email) => {
  const existingUser = await userGetByEmail(email);

  if (!existingUser) throw new Error("User Does not exist");

  const notifications = await NotificationModel.find({ recruiter: email,read:false });
  const notificationsWithJobTitle = notifications.map(async (notification) => {
    const jobId = notification.jobId;
    const existingJob = await getJobById(jobId);
    if (!existingJob) throw new Error("Job does not exist!");
    const title = existingJob.title;
    const newNotification = { ...notification._doc, jobTitle: title };
    return newNotification;
  });

  let notificationListWithJobTitle = [];
  await Promise.all(notificationsWithJobTitle).then((result) => {
    notificationListWithJobTitle = result;
  });
  return notificationListWithJobTitle;
};

export const createNotification = asyncHandler(async (data) => {
  console.log("data",data)
  const { recruiter, applicant, jobId, applicationId, status, read } = data;
  if (!recruiter) throw new Error("Recruiter is missing");

  const notificationDoc = new NotificationModel(data);

  return await notificationDoc.save();
});

export const updateNotificationById = async (req) => {
  const notification = req.body;
  const { read } = notification;
  const existingNotification = await getNotificationById(notification._id);
  if (!existingNotification) throw new Error("Notification does not exist!");
  if (existingNotification.recruiter !== req.users.email)
    throw new Error("User does not have right to change this notification!");

  if (read) existingNotification.read = read;

  return await existingNotification.save();
};

export const getNotificationById = async (id) => {
  return await NotificationModel.findOne({ [MongoFields.id]: id });
};
