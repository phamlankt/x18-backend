const logAPI = (req, res, next) => {
  const currentDate = new Date();
  console.log(`API is comming at ${currentDate}`);
  next();
};

export default logAPI;
