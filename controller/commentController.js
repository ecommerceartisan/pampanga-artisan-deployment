import fs from "fs";
import productModel from "../models/productModel.js"; // Import the product model
import Comment from "../models/commentModel.js";
import CommentModel from "../models/commentModel.js";

export const addCommentController = async (req, res) => {
  try {
    const { text } = req.fields;
    const { photo } = req.files;
    const { productId } = req.params;

    // Validation
    if (!text) {
      return res.status(400).send({ error: "Text is required for a comment" });
    }

    const comment = new Comment({
      text,
      user: req.user._id,
      product: productId,
    });

    if (photo) {
      comment.photo.data = fs.readFileSync(photo.path);
      comment.photo.contentType = photo.type;
    }

    await comment.save();

    // Update product with the new comment
    await productModel.findByIdAndUpdate(
      productId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    res.status(201).send({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in adding comment",
    });
  }
};


// Get comments for a product
export const getCommentsController = async (req, res) => {
  try {
    const comments = await CommentModel
    .find({ product: req.params.pid })
    .populate({
      path: "user",
      select: "name"
    });
    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while getting comments",
      error: error.message,
    });
  }
};


// Get comment photo
export const getCommentPhotoController = async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.cid);
    if (comment.photo && comment.photo.data) {
      res.set("Content-Type", comment.photo.contentType);
      return res.send(comment.photo.data);
    } else {
      res.status(404).json({
        success: false,
        message: "Comment photo not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while getting comment photo",
      error: error.message,
    });
  }
};
