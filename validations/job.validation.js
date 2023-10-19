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
  deadline: Yup
  .date()
    .transform(function (value, originalValue) {
      if (this.isType(value)) {
        return value;
      }
      const result = parse(originalValue, "dd.MM.yyyy", new Date());
      return result;
    })
    .typeError("Please enter a valid date")
    .min(new Date(), "Deadline must be at least from today")
    .required("Deadline is required"),
  salary: Yup.string().required("Salary is required"),
  sectors: Yup.array()
    .of(
      Yup.string().test("valid", "Invalid business sector value!", (val) => {
        if (businessSectors.includes(val)) return true;
        return false;
      })
    )
    .required("Business sector is required"),
  location: Yup.string().required("Location is required"),
  city: Yup.string().required("City is required"),
  position: Yup.string().required("Position is required"),
  amount: Yup.string().required("Amount is required"),
  description: Yup.string().required("Job description is required"),
});
