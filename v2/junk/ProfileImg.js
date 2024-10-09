import mongoose, { Schema } from "mongoose";

const ProfileImg = Schema({
  id: {
    type: String,
    required: [true, "Error getting user id"],
  },
  img_location: {
    type: String,
    required: [true, "Path not specified"],
  },
});

export default mongoose.model("ProfileImg", ProfileImg);
