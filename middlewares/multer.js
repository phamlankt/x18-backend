import multer from "multer";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../globals/config.js";

const storage = multer.memoryStorage();
// Configure multer storage and file name
const storageDisk = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storageDisk });

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

export const multipleUpload = (req, res, next) => {
  // Use multer upload instance
  upload.array("documents", 8)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Retrieve uploaded files
    const files = req.files;
    const errors = [];

    // Validate file types and sizes
    files.forEach((file) => {
      const allowedTypes = ["application/pdf"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.originalname}`);
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    // Handle validation errors
    if (errors.length > 0) {
      // Remove uploaded files
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      return res.status(400).json({ errors });
    }

    // Attach files to the request object
    req.files = files;

    // Proceed to the next middleware or route handler
    next();
  });
};

export const uploadFile = multer({ storage });
