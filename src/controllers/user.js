const ErrorResponse = require('../middleware/error');
const asyncHandler = require('../middleware/async');
const User = require('../models/user');
const sharp = require('sharp');

//@desc     Register user
//@route    POST /users
//@access   Public

exports.register = asyncHandler(async (req, res) => {
  try {
    const user = await User.create(req.body);
    sendTokenResponse(user, 200, res);
  } catch (e) {
    res.status(400).send(e);
  }
});

//@desc     Login user
//@route    POST /users/login
//@access   Public
exports.login = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    sendTokenResponse(user, 200, res);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Get token from modek, create cookie and send responese
const sendTokenResponse = async (user, statusCode, res) => {
  //Create tokne
  const token = await user.generateAuthToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.createdAt;
  delete userObject.updatedAt;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ userObject, token });
};

//@desc     Get current logged in user
//@route    GET /users/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const userObject = user.toObject();
  delete userObject.tokens;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  res.status(200).json({
    success: true,
    data: userObject,
  });
});

//@desc     Upload avatar
//@route    POST /users/me/avatar
//@access   Private
exports.uploadAvatar = asyncHandler(async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send({ success: true });
});

//@desc     Delete avatar
//@route    DELETE /users/me/avatar
//@access   Private
exports.deleteAvatar = asyncHandler(async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//@desc     Get avatar
//@route    GET /users/:id/avatar
//@access   Private
exports.getAvatar = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error('');
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//@desc     Update User
//@route    PUT /users/:id
//@access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

//@desc     Add User's Experience
//@route    PUT /users/addexperience/:id
//@access   Private
exports.addUserExperience = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.userid}`, 404)
    );
  }
  user.experience.push(req.body);
  user.save();

  res.status(200).json({ success: true, data: user });
});

//@desc     Update User's Experience
//@route    PUT /users/addexperience/:userid/:expid
//@access   Private
exports.updateUserExperience = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.userid);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.userid}`, 404)
    );
  }
  let index = user.experience.findIndex((obj) => obj._id == req.params.expid);
  user.experience[index] = req.body;
  user.save();

  res.status(200).json({ success: true, data: user });
});

//@desc     Add User's Education
//@route    PUT /users/addeducation/:id
//@access   Private
exports.addUserEducation = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.userid}`, 404)
    );
  }
  user.education.push(req.body);
  user.save();

  res.status(200).json({ success: true, data: user });
});

//@desc     Update User's Education
//@route    PUT /users/addeducation/:userid/:expid
//@access   Private
exports.updateUserEducation = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.userid);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.userid}`, 404)
    );
  }
  let index = user.education.findIndex((obj) => obj._id == req.params.expid);
  user.education[index] = req.body;
  user.save();

  res.status(200).json({ success: true, data: user });
});

//@desc     Get Users
//@route    GET /users
//@access   Private
exports.getUsers = asyncHandler(async (req, res) => {
  let users = await User.find({})
    .where('_id')
    .ne(req.user._id)
    .select('name status department');
  res.status(200).json({ success: true, data: users });
});

//@desc     Get Users Suggestion
//@route    GET /users/suggestion
//@access   Private
exports.userSuggestion = asyncHandler(async (req, res) => {
  let users = await User.find({ _id: { $nin: [...req.user.following] } })
    .where('_id')
    .ne(req.user._id)
    .select('name status department');
  res.status(200).json({ success: true, data: users });
});

//@desc     Get User Followers
//@route    GET /users/followers
//@access   Private
exports.userFollowers = asyncHandler(async (req, res) => {
  let users = await User.find({ _id: { $in: [...req.user.followers] } })
    .where('_id')
    .ne(req.user._id)
    .select('name status department');
  res.status(200).json({ success: true, data: users });
});

//@desc     Get User Following
//@route    GET /users/Followings
//@access   Private
exports.userFollowings = asyncHandler(async (req, res) => {
  let users = await User.find({ _id: { $in: [...req.user.following] } })
    .where('_id')
    .ne(req.user._id)
    .select('name status department');
  res.status(200).json({ success: true, data: users });
});

//@desc     Get User Details
//@route    GET /users/:id
//@access   Private
exports.getUserDetails = asyncHandler(async (req, res) => {
  let loggedInUser = false;
  if (req.params.id == req.user._id) {
    loggedInUser = true;
  }
  let user = await User.findById(req.params.id);
  const userObject = user.toObject();
  // delete userObject.avatar;
  delete userObject.tokens;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  res.status(200).json({ success: true, data: userObject, loggedInUser });
});

//@desc     Follow User
//@route    POST /users/follow
//@access   Private

exports.FolloUser = asyncHandler(async (req, res) => {
  const { follower, following, action } = req.body;
  console.log(follower + '-- ' + following + '-- ' + action);

  // let follower = req.user._id;

  try {
    switch (action) {
      case 'follow':
        await Promise.all([
          User.findByIdAndUpdate(follower, { $push: { following: following } }),
          User.findByIdAndUpdate(following, { $push: { followers: follower } }),
        ]);
        break;

      case 'unfollow':
        await Promise.all([
          User.findByIdAndUpdate(follower, { $pull: { following: following } }),
          User.findByIdAndUpdate(following, { $pull: { followers: follower } }),
        ]);
        break;

      default:
        break;
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
    });
  }
});
