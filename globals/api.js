import { ResponseFields } from "./fields/response.js";

const AUTH = {
  access_token: "access-token",
  email: "email",
  password: "password",
  pa: "pa",
};

const RESPONSE = (data, message, ex, error) => {
  const result = {};
  if (data) result[ResponseFields.data] = data;
  if (message) result[ResponseFields.message] = message;
  if (ex) result[ResponseFields.catch] = ex;
  if (error) result[ResponseFields.error] = error;

  return result;
};

export { AUTH, RESPONSE };
