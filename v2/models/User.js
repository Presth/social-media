import mongoose, { Schema } from "mongoose";
import timestamp from "./timestamp.js";

const UserSchema = Schema({
  id: {
    type: String,
    required: [true, "Error generating Id"],
  },
  name: {
    type: String,
    required: [true, "Name must be provided"],
  },
  username: {
    type: String,
    required: [true, "Username must be provided"],
  },
  email: {
    type: String,
    require: [true, "Email is required"],
    index: true,
  },
  password: {
    type: String,
    require: [true, "Password not supplied"],
    minlength: [6, "Password must be up to 6 characters"],
  },
  phone_no: {
    type: String,
    require: [true, "Phone number must be provided"],
  },
  img_location: {
    type: String,
  },
  createdAt: Date,
  updatedAt: Date,
});

export default mongoose.model("User", UserSchema.plugin(timestamp));
