import { unlink, unlinkSync } from "fs";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.url === "/picture") {
      cb(null, "./public/profile");
    } else {
      cb(null, "./public/attachments");
    }
  },
  filename: function (req, file, cb) {
    if (!file) return;
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});

export const deleteFile = (file_path) => {
  const removeFile = unlink(file_path, (err) => {});

  return removeFile;
};
