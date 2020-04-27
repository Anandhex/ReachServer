const Post = require('../models/postModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const axios = require('axios');
exports.getPosts = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = await features.query.populate('comments');
  res.status(200).json({ status: 'success', data: { posts } });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(
    Post.find({ userId: req.params.userId }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = await features.query.populate('comments');
  res.status(200).json({ status: 'success', data: { posts } });
});

exports.getRecommendPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  console.log(req.query.recommend);
  let resp = await axios.get(
    `https://dry-savannah-75351.herokuapp.com/recommend-interest?interests=${req.user.areaOfInterest
      .filter(interest => interest)
      .join(':')}}`
  );
  let interests = resp.data.interests;
  interests.push(...req.user.areaOfInterest);
  interests = interests.filter(interest => interest);
  console.log(interests);
  const posts = await Post.find({
    $and: [{ userId: { $nin: userId } }, { category: { $in: interests } }]
  });
  res.status(200).json({ status: 'success', data: { posts } });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId).populate('comments');
  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.getLikedPost = catchAsync(async (req, res, next) => {
  const post = await Post.find({ _id: { $in: [...req.user.liked] } });
  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.addPost = catchAsync(async (req, res, next) => {
  req.body.userId = req.params.userId ? req.params.userId : req.user._id;
  const resp = await axios.get(
    `https://dry-savannah-75351.herokuapp.com/predict-sentiment?comment=${encodeURI(
      req.body.postContent
    )}`
  );
  if (req.user._id.equals(req.body.userId)) {
    if (resp.data.Sentiment === 'Positive') {
      const post = await Post.create(req.body);
      res.status(201).json({ status: 'success', data: { data: post } });
    } else {
      return next(
        new AppError('The post is not appropriate to be posted', 400)
      );
    }
  } else {
    next(new AppError('Unauthorized access', 401));
  }
});

exports.updatePost = catchAsync(async (req, res, next) => {
  let post = await Post.findOne({ _id: req.params.postId });
  if (post) {
    if (req.user._id) {
      if (post.likes != req.body.likes) {
        let user = req.user;
        user.liked.push(post._id);
        user = await User.findByIdAndUpdate(user._id, user, { new: true });

        post.likes += 1;
        post = await Post.findByIdAndUpdate(post._id, post, { new: true });
        res.status(200).json({
          status: 'success',
          data: { post, user }
        });
      } else if (req.user._id.equals(post.userId)) {
        const resp = await axios.get(
          `https://dry-savannah-75351.herokuapp.com/predict-sentiment?comment=${encodeURI(
            req.body.postContent
          )}`
        );
        if (resp.data.Sentiment === 'Positive') {
          post = await Post.findByIdAndUpdate(req.params.postId, req.body, {
            new: true
          });
        } else {
          return next(
            new AppError('The post is not appropriate to be updated', 400)
          );
        }
        res.status(200).json({ status: 'success', data: { data: post } });
      } else {
        next(
          new AppError('Unauthorized. Please login to update the post', 401)
        );
      }
    } else {
      next(new AppError('Unauthorized. Please login to update the post', 401));
    }
  } else {
    next(new AppError('Post not found', 404));
  }
});

exports.deletePost = catchAsync(async (req, res, next) => {
  let post = await Post.findOne({ _id: req.params.postId });
  if (req.user._id.equals(post.userId)) {
    post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) {
      return next(new AppError('No post found with that ID', 404));
    }
    res.status(201).json({ status: 'success', message: 'deleted' });
  } else {
    next(new AppError('Unauthorized. Please login to update the post', 401));
  }
});
