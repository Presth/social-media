import { Router } from "express";
import multer from "multer";

import { uploadFile } from "../controllers/uploadFile.js";


const router = Router()

// file uploading config
const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, './uploads');
     },
     filename: function (req, file, cb) {
          cb(null, file.originalname);
     }
});

const upload = multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } });


router.post("/", upload.single('file'), uploadFile)
export default router