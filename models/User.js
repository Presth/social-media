import mongoose, { Schema } from "mongoose";
import timestamp from "./timestamp.js";

const UserSchema = Schema({
     name: {
          type: String,
          required: [true, "Name must be provided"]
     },
     email: {
          type: String,
          require: [true, "Email is required"],
          index: true
     },
     password: {
          type: String,
          require: [true, "Password must be specified"],
          minlength: [6, "Password must be up to 6 characters"]
     },
     createdAt: Date,
     updatedAt: Date,
})

export default mongoose.model("User", UserSchema.plugin(timestamp))