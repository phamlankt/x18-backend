import { JobModel } from "../../globals/mongodb.js";

export const checkJobStatus = async () => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  await JobModel.updateMany(
    { deadline: { $lt: currentDate }, status: "open" },
    { $set: { status: "expired" } }
  );
};
