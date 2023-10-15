import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  role: Yup.string()
    .oneOf(["recruiter", "applicant"])
    .required("Role is required"),
  password: Yup.string().min(6).required(),
});
