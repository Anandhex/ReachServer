const User = require('../models/userModel');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const axios = require('axios');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: 'reachout-media'
});

const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'reachout-media/profile',
    acl: 'public-read',
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          '-' +
          Date.now() +
          path.extname(file.originalname)
      );
    }
  }),
  limits: { fileSize: 500000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('profileImage');

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

exports.getInterestRecommendation = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const user = await axios.get(
    `http://127.0.0.1:5001/suggest-category?age=${req.user.dob}&gender=${req.user.gender}`
  );
  res.status(200).json({ status: 'success', data: { data: user.data } });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  res.status(200).json({ status: 'success', data: { users } });
});

exports.saveUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ status: 'success', data: { user: newUser } });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({ path: 'friends' })
    .populate({ path: 'posts' });
  res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(201).json({ status: 'success', data: { message: 'deleted' } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let user;
  if (req.user._id) {
    user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true
    });
  } else if (!user) {
    return next(new AppError('No user found with that ID', 404));
  } else {
    return next(new AppError('Unauthorized access', 403));
  }
  res.status(201).json({ status: 'success', data: { user } });
});

exports.getFriends = catchAsync(async (req, res, next) => {
  let friends = req.user.friends;
  friends = await User.find({ _id: { $in: friends } });
  res.status(200).json({ status: 'success', data: { data: friends } });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const friend = await User.findById({ _id: req.body.userId });
  if (!friend) {
    return next(new AppError('No user with the particular ID exits', 404));
  }
  let user;
  if (!req.user._id.equals(friend._id)) {
    user = req.user;
    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
      user = await User.findByIdAndUpdate(req.user._id, user, { new: true });
    } else {
      return next(new AppError('User have already added them as friend', 400));
    }
  }
  res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteFriend = catchAsync(async (req, res, next) => {
  const friends = req.user.friends.filter(
    friend => friend != req.params.userId
  );
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { friends } },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getFriendsRecommendationList = catchAsync(async (req, res, next) => {
  req.user.friends.push(req.user._id);
  const recommendation = await User.find({ _id: { $nin: req.user.friends } });
  res.status(200).json({ data: recommendation });
});

exports.uploadProfileImg = catchAsync(async (req, res, next) => {
  imageUpload(
    req,
    res,
    catchAsync(async error => {
      if (error) {
        console.log(error);
        next(new AppError(error, 400));
      } else {
        if (req.file === undefined) {
          console.log('no file selected');
          next(new AppError('File not uploaded', 400));
        } else {
          const imageName = req.file.key;
          const imageLocation = req.file.location;
          const user = await User.findByIdAndUpdate(
            req.user.id,
            {
              profile_img: imageLocation
            },
            {
              new: true
            }
          );
          if (!user) {
            next(new AppError('Something went wrong!', 500));
          }
          res.status(201).json({
            status: 'success',
            data: { user }
          });
        }
      }
    })
  );
});
