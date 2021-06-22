const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { env } = require('process');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        } else if (!value.endsWith('@marwadiuniversity.ac.in')) {
          throw new Error('Only Marwadi university students are allowed');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('please change the password this is not aplicable!');
        }
      },
      select: false,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0 || value > 8) {
          throw new Error('it is not Valid Semester!');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
          select: false,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
    connections: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Hey, I am using this portal',
    },
    about: {
      type: String,
    },
    featured: {
      type: String,
    },
    experience: [
      {
        orgname: {
          type: String,
        },
        position: {
          type: String,
        },
        date: {
          type: String,
        },
        address: {
          type: String,
        },
      },
    ],
    education: [
      {
        instname: {
          type: String,
        },
        degree: {
          type: String,
        },
        date: {
          type: String,
        },
        address: {
          type: String,
        },
      },
    ],
    followers: Array,
    following: Array,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
