import { jwtVerify } from "../globals/jwt.js";
import { AUTH } from "../globals/api.js";

const jwtCheck = (req, res, next) => {
  const token = req.headers[AUTH.access_token];

  if (!token) {
    return res.status(400).json({
      message: "Token is not provided",
    });
  }

  try {
    const decoded = jwtVerify(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(403).json({
        message: "Token is expired",
      });
    }

    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};

export { jwtCheck };
