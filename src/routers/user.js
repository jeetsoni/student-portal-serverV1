const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const multer = require('multer');

const {
  register,
  login,
  getMe,
  uploadAvatar,
  deleteAvatar,
  getAvatar,
  updateUser,
  updateUserExperience,
  addUserExperience,
  addUserEducation,
  updateUserEducation,
  getUsers,
  getUserDetails,
  FolloUser,
  userSuggestion,
  userFollowers,
  userFollowings,
} = require('../controllers/user');
const { protect } = require('../middleware/auth');

router.route('/').post(register).get(protect, getUsers);

router.get('/suggestion', protect, userSuggestion);

router.get('/followers', protect, userFollowers);

router.get('/followings', protect, userFollowings);

router.post('/follow', protect, FolloUser);

router.post('/login', login);

router.get('/me', protect, getMe);

const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('please uplode image only!'));
    }
    cb(undefined, true);
  },
});

router
  .route('/me/avatar')
  .post(protect, upload.single('avatar'), uploadAvatar)
  .delete(protect, deleteAvatar);

router.get('/:id/avatar', getAvatar);

router.route('/:id').put(protect, updateUser).get(protect, getUserDetails);

router.put('/addexperience/:id', protect, addUserExperience);

router.put('/addexperience/:userid/:expid', protect, updateUserExperience);

router.put('/addeducation/:id', protect, addUserEducation);

router.put('/addeducation/:userid/:expid', protect, updateUserEducation);

module.exports = router;
