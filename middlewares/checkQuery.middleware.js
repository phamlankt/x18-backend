import asyncHandler from "express-async-handler";

export const checkQuery = (ruleArray) => {
  return asyncHandler(async (req, res, next) => {
    const query = req.query;
    const queryKeys = Object.keys(query);
    queryKeys.forEach((key) => {
      if (!ruleArray.includes(key)) {
        res.status(400);
        throw new Error("Invalid query params");
      }
    });
    next();
  });
};
