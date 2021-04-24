const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/auth");

//@route Post api/post
//@desc Create Post
//@access private
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate("user", [
      "username",
    ]);
    res.json({ success: true, posts });
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route Post api/post
//@desc Create Post
//@access private
router.post("/", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  //Simple Validation
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: "Title is required!" });

  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      status: status || "TO LEARN",
      user: req.userId,
    });

    await newPost.save();
    res.json({ success: true, message: "Happy learning!", post: newPost });
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route PUT api/post
//@desc Update Post
//@access private

router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  //Simple Validation
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: "Title is required!" });

  try {
    let updatePost = {
      title,
      description: description || "",
      url: (url.startsWith("https://") ? url : `https://${url}`) || "",
      status: status || "TO LEARN",
      user: req.userId,
    };

    const postUpdateCondition = { _id: req.params.id, user: req.userId };
    updatePost = await Post.findOneAndUpdate(postUpdateCondition, updatePost, {
      new: true,
    });
    // User not authorised to update post or post not found
    if (!updatePost)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised!",
      });
    req.json({
      success: true,
      message: "Excellent progress!",
      post: updatePost,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route DELETE api/post
//@desc Delete Post
//@access private

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postDeleteCondition = { _id: req.params.id, user: req.userId };

    const deletedPost = await Post.findOneAndDelete(postDeleteCondition);

    // User not authorised to update post or post not found
    if (!deletedPost)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised!",
      });
    req.json({
      success: true,
      post: deletedPost,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
