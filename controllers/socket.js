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

export {onlineUsers,addNewUser,removeUser,getUser}