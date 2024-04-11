import mongoose, { Schema } from "mongoose";
import timestamp from "./timestamp.js";

const PostSchema = Schema({
     posted_by: {
          type: String,
          require: [true, "User not found"],
     }, content: {
          type: String,
     },
     attachment: {
          type: String,
          default: ""
     },
     likes: {
          type: Array,
          default: []
     },
     createdAt: Date,
     updatedAt: Date,
})

export default mongoose.model("Posts", PostSchema.plugin(timestamp))