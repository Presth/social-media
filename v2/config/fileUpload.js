import { readFileSync, unlink, unlinkSync } from "fs";
import path from "path";
import axios from "axios";

import multer from "multer";
import asyncWrapper from "../middleware/async.js";
import { error } from "./respTypes.js";

const __dirname = path.resolve();

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

export const uploadToExt = asyncWrapper(async (req, res, next) => {
  const attachment = req.file.filename;
  console.log(attachment);
  const purpose = req.url === "/picture" ? "profile" : "attachments";

  let imgPath = path.join(__dirname, `/public/${purpose}/`, attachment);
  const img = readFileSync(imgPath, { encoding: "base64" });

  const chunkSize = 10 * 1024;
  let totalChunks = Math.ceil(img.length / chunkSize);

  let startByte = 0;
  let endByte = chunkSize;
  let uploadStatus = true;

  for (let i = 0; i < totalChunks; i++) {
    if (!uploadStatus) {
      let formdata = new FormData();
      formdata.append("removeChunks", true);
      formdata.append("filename", attachment);
      formdata.append("totalChunks", totalChunks);

      await axios.post(process.env.EXTERNAL_DOMAIN, formdata);
      deleteFile(imgPath);
      break;
    }

    let currentChunk = img.slice(startByte, endByte);

    const formdata = new FormData();
    formdata.append("filename", attachment);
    formdata.append("isChunk", true);
    formdata.append("currentChunk", currentChunk);
    formdata.append("chunkNumber", i);
    const uploadResp = await axios.post(process.env.EXTERNAL_DOMAIN, formdata);

    uploadStatus = uploadResp.data === "success" ? true : false;
    startByte = endByte;
    endByte += chunkSize;
  }

  if (uploadStatus) {
    const formdata = new FormData();
    formdata.append("merge", true);
    formdata.append("filename", attachment);
    formdata.append("totalChunks", totalChunks);
    formdata.append("purpose", purpose);

    const uploadResp = await axios.post(process.env.EXTERNAL_DOMAIN, formdata);
    if (uploadResp?.data == "success") {
      deleteFile(imgPath);
      next();
      return;
    }
  } else {
    return res.status(200).json({ error, message: "Unable to upload File" });
  }
});
