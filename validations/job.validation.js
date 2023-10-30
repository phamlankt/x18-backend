import * as Yup from "yup";
import { businessSectorGetAll } from "../services/mongo/businessSectors.js";

let businessSectors = [];
export const getBusinessSectos = async () => {
  const result = await businessSectorGetAll();
  result.map((bs) => businessSectors.push(bs.name));
};
getBusinessSectos();

export const jobSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  deadline: Yup.date()
    .typeError("Please enter a valid date")
    .min(new Date(), "Deadline must be at least from today")
    .required("Deadline is required"),
  salary: Yup.string().required("Salary is required"),
  sectors: Yup.array().required("Sectors is required"),
  location: Yup.string().required("Location is required"),
  city: Yup.string().required("City is required"),
  position: Yup.string().required("Position is required"),
  amount: Yup.number()
    .min(1, "Amount is required")
    .max(100, "Amount is too large")
    .required("Amount is required"),
  description: Yup.string().required("Job description is required"),
});
