import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    user: {
      type: mongoose.ObjectId,
      ref: "users", 
      required: true,
    },
    product: {
      type: mongoose.ObjectId,
      ref: "Products",
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
