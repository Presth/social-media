import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
const connectDB = (url) => {
     return mongoose.connect(url);
}

export default connectDB