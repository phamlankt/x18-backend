import multer from "multer";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../globals/config.js";

const storage = multer.memoryStorage();

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_APIKEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  stream: true,
});
export async function uploadStream(buffer) {
  return new Promise((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream(
      { folder: "avatar" },
      (err, result) => {
        if (err) return rej(err);
        res(result);
      }
    );
    let str = Readable.from(buffer);
    str.pipe(theTransformStream);
  });
}

export const uploadFile = multer({ storage });
