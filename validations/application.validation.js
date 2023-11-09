import * as Yup from "yup";
import { businessSectorGetAll } from "../services/mongo/businessSectors.js";

let businessSectors = [];
export const getBusinessSectos = async () => {
  const result = await businessSectorGetAll();
  result?.sectors.map((bs) => businessSectors.push(bs.name));
};
getBusinessSectos();

export const applicationSchema = Yup.object().shape({
  jobId: Yup.string().required("Jobid is required"),
  note: Yup.string(),
  documentNames: Yup.array().required("Documents are required"),
});
