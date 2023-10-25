import {
  adminProfileSchema,
  applicantProfileSchema,
  recruiterProfileSchema,
} from "../validations/profile.validation.js";

export const validationMdw = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.errors.join(", ") });
  }
};

export const validationProfileMdw = () => async (req, res, next) => {
  const { roleName } = req.users;
  const schema =
    roleName === "recruiter"
      ? recruiterProfileSchema
      : roleName === "applicant"
      ? applicantProfileSchema
      : roleName === "admin" && adminProfileSchema;

  try {
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.errors.join(", ") });
  }
};

export const parseFormDataToBody = (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }
  if (body) {
    req.body = body;
    next();
  }
};
