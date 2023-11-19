import { createNotification } from "../services/mongo/notification.js";
import { getUserById } from "../services/mongo/users.js";

let onlineUsers = [];

const addNewUser = (id, email, socketId) => {
  !onlineUsers.some((user) => user.email === email) &&
    onlineUsers.push({ id, email, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (id) => {
  return onlineUsers.find((user) => user.id === id);
};
const notifiyApplicationStatus = (io, data) => {
  const { jobTitle } = data;
  const { recruiter, applicant, status } = data;
  if (status === "confirmed" || status === "rejected") {
    const applicantOnline = getUser(applicant);

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
        applicantOnline &&
          io
            .to(applicantOnline.socketId)
            .emit("getJobNotification", { ...result._doc, jobTitle });
      });
    });
  } else if (status === "sent" || status === "cancelled") {
    const recruiterOnline = getUser(recruiter);

    //save notification to DB
    getUserById(recruiter).then((existingRecruiter) => {
      if (!existingRecruiter) throw new Error("Recruiter does not exist!");
      const savedData = {
        ...data,
        recruiter: existingRecruiter.email,
        read: false,
      };

      createNotification(savedData).then(
        (result) =>{
          // check if user is online then send notification
          recruiterOnline &&
          io
            .to(recruiterOnline.socketId)
            .emit("getJobNotification", { ...result._doc, jobTitle })}
      );
    });
  }
};

const handleSocketEvents = (io, socket) => {
  // console.log('someone joined!')
  socket.on("newUser", ({ email, id }) => {
    console.log("email", email, id, socket.id);
    addNewUser(id, email, socket.id);
    console.log("onlineUsers", onlineUsers);
  });

  socket.on("sendApplicationEvent", (data) =>
    notifiyApplicationStatus(io, data)
  );

  socket.on("disconnect", () => {
    removeUser(socket.socketId);
    console.log("user disconnected");
    console.log("onlineUsers", onlineUsers);
  });
};

export { onlineUsers, addNewUser, removeUser, getUser, handleSocketEvents };
