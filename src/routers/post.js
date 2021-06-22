const express = require('express');
const router = new express.Router();
const Post = require('../models/post');
const multer = require('multer');
const path = require('path');

const {
  addPost,
  getPost,
  getUserPost,
  getlogUserPost,
} = require('../controllers/post');
const { protect } = require('../middleware/auth');

//Multer Confegriation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router
  .route('/')
  .post(protect, upload.single('body_photo'), addPost)
  .get(protect, getPost);

router.route('/user').get(protect, getlogUserPost);

router.route('/:id').get(protect, getUserPost);

module.exports = router;
