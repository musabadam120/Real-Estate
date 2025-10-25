// backend/middleware/uploadMiddleware.js
import multer from "multer";

const storage = multer.memoryStorage();

const allowed = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/zip",
  "application/x-zip-compressed",
  "text/plain"
];

const fileFilter = (req, file, cb) => {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Allowed: images, pdf, doc, xls, zip, txt"), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter,
});

export default upload;
