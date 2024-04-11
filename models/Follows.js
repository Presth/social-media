import mongoose, { Schema } from "mongoose";


const FollowSchema = Schema({
     user: {
          type: String,
          require: [true, "user not found"]
     },
     following: {
          type: String,
          require: [true, "user not selected"]
     }
})


// followers: {
//      type: Array,
//      default: []
// },

export default mongoose.model("Follows", FollowSchema)