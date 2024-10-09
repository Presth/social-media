import fs from "fs";
import { success } from "../config/respTypes.js";
import { v4 } from "uuid";

// app.post('/api/v1/upload', upload.single("file"), async (req, res) => {
export const uploadFile = async (req, res) => {
  const chunk = Buffer.from(req.body.file.split(",")[1], "base64");
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const fileName = req.body.originalname;

  const chunkDir = "./chunks"; // Directory to save chunks

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);
    console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

    let newFilename = "";
    if (chunkNumber === totalChunks) {
      newFilename = await mergeChunks(fileName, totalChunks);
      // If this is the last chunk, merge all chunks into a single file
    }

    res.status(200).send({
      status: newFilename == "" ? "inprogress" : "complete",
      file_path: newFilename,
      message: "Chunk uploaded successfully",
    });
  } catch (error) {
    console.error("Error saving chunk:", error);
    res.status(500).json({ error: "Error saving chunk" });
  }
};

const mergeChunks = async (fileName, totalChunks) => {
  const chunkDir = "./chunks";
  const mergedFilePath = "./public/attachments";
  const ext = fileName.split(".")[1];
  const newFilename = `${v4()}.${ext}`;

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${newFilename}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i + 1}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }
  writeStream.end();
  return newFilename;
};
