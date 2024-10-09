import mongoose, { Schema } from "mongoose";
import timestamp from "./timestamp.js";

const CommentSchema = Schema({
     post_id: String,
     comment: {
          type: String,
          require: [true, "Comment not provided"]
     },
     user: {
          type: String,
          require: [true, "User not found"]
     },
     createdAt: Date,
     updatedAt: Date,
})

export default mongoose.model("Comments", CommentSchema.plugin(timestamp))