import { createNotification } from "../services/mongo/notification.js";
import { getUserById } from "../services/mongo/users.js";

let onlineUsers = [];

const addNewUser = (id, email, socketId) => {
  onlineUsers.push({ id, email, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (id) => {
  return onlineUsers.filter((user) => user.id === id);
};
const notifiyApplicationStatus = (io, data) => {
  const { jobTitle } = data;
  const { recruiter, applicant, status } = data;
  if (status === "confirmed" || status === "rejected") {
    const applicantsOnline = getUser(applicant);

    //save notification to DB
    getUserById(applicant).then((existingApplicant) => {
      if (!existingApplicant) throw new Error("Applicant does not exist!");
      const savedData = {
        ...data,
        applicant: existingApplicant.email,
        read: false,
      };
      createNotification(savedData).then((result) => {
        // check if user is online then send notification
        if (applicantsOnline.length > 0) {
          applicantsOnline.map((applicantOnline) => {
            io.to(applicantOnline.socketId).emit("getJobNotification", {
              ...result._doc,
              jobTitle,
            });
          });
        }
      });
    });
  } else if (status === "sent" || status === "cancelled") {
    const recruitersOnline = getUser(recruiter);

    //save notification to DB
    getUserById(recruiter).then((existingRecruiter) => {
      if (!existingRecruiter) throw new Error("Recruiter does not exist!");
      const savedData = {
        ...data,
        recruiter: existingRecruiter.email,
        read: false,
      };

      createNotification(savedData).then((result) => {
        // check if user is online then send notification
        if (recruitersOnline.length > 0)
          recruitersOnline.map((recruiterOnline) => {
            io.to(recruiterOnline.socketId).emit("getJobNotification", {
              ...result._doc,
              jobTitle,
            });
          });
      });
    });
  }
};

const handleSocketEvents = (io, socket) => {
  socket.on("newUser", ({ email, id }) => {
    addNewUser(id, email, socket.id);
    console.log("onlineUsers", onlineUsers);
  });

  socket.on("sendApplicationEvent", (data) =>
    notifiyApplicationStatus(io, data)
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("onlineUsers after disconnected", onlineUsers);
  });
};

export { onlineUsers, addNewUser, removeUser, getUser, handleSocketEvents };
