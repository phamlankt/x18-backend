import * as Yup from "yup";
import { businessSectorGetAll } from "../services/mongo/businessSectors.js";

let businessSectors = [];
async function getBusinessSectos() {
  const result = await businessSectorGetAll();
  result.map((bs) => businessSectors.push(bs.name));
}
getBusinessSectos();

export const recruiterProfileSchema = Yup.object().shape({
  companyName: Yup.string().required("Company Name is required"),
  email: Yup.string().email(),
  phoneNumber: Yup.string().required("Phone Number is required"),
  address: Yup.string().required("Address is required"),
  sectors: Yup.array()
    .of(
      Yup.string().test("valid", "Invalid business sector value!", (val) => {
        if (businessSectors.includes(val)) return true;
        return false;
      })
    )
    .required("Business sector is required"),
  description: Yup.string().required("Company description is required"),
});

export const applicantProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  age: Yup.string().required("Age is required"),
  gender: Yup.string().oneOf(["male","female"]).required("Gender is required"),
  email: Yup.string().email(),
  phoneNumber: Yup.string().required("Phone Number is required"),
  address: Yup.string().required("Address is required"),
  sectors: Yup.array().of(
    Yup.string().test("valid", "Invalid business sector value!", (val) => {
      if (businessSectors.includes(val)) return true;
      return false;
    })
  ),
  description: Yup.string().required("Company description is required"),
});

export const adminProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email(),
  phoneNumber: Yup.string().required("Phone Number is required"),
});
