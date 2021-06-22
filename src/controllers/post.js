const ErrorResponse = require('../middleware/error');
const asyncHandler = require('../middleware/async');
const Post = require('../models/post');
const User = require('../models/user');
const sharp = require('sharp');

//@desc     Add Post
//@route    POST /post
//@access   Private

exports.addPost = asyncHandler(async (req, res) => {
  console.log(req.file);
  // const buffer = await sharp(req.file.buffer).toBuffer();
  // req.body.body_photo = buffer
  req.body.user = req.user._id;
  req.body.body_photo = req.file.path;
  console.log(req.body);
  let post = await Post.create(req.body);
  res.status(201).json({ success: true, data: post });
});

//@desc     Get Post
//@route    Get /post
//@access   Private

exports.getPost = asyncHandler(async (req, res) => {
  let posts = await Post.find({})
    .populate('user', 'name status')
    .sort({ _id: -1 });
  res.status(200).json({ success: true, data: posts });
});

//@desc     Get loggedIn user Post
//@route    Get /post/user
//@access   Private

exports.getlogUserPost = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  let posts = await Post.find({ user: req.user._id })
    .populate('user', 'name status')
    .sort({ _id: -1 });
  res.status(200).json({ success: true, data: posts });
});

//@desc     Get user Post
//@route    Get /post/:id
//@access   Private

exports.getUserPost = asyncHandler(async (req, res) => {
  let posts = await Post.find({ user: req.params.id })
    .populate('user', 'name status')
    .sort({ _id: -1 });
  res.status(200).json({ success: true, data: posts });
});
