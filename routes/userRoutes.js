const express = require('express');

const postRoutes = require('./postRoutes');

const {
  getUsers,
  saveUser,
  getUser,
  updateUser,
  deleteUser,
  addFriend,
  getFriends,
  getFriendsRecommendationList,
  getInterestRecommendation,
  deleteFriend,
  getUserStats,
  uploadProfileImg
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect
} = require('../controllers/authController');

const {
  getPosts,
  getPost,
  getLikedPost
} = require('../controllers/postController');

const router = express.Router();

router.use('/:userId/posts', postRoutes);
router.get('/getUserStats/:userId', getUserStats);
router.get('/getLikedPost', protect, getLikedPost);
router.get('/posts', getPosts);
router.get('/posts/:postId', getPost);
router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.get('/resetPassword/:token', resetPassword);

router.route('/profileUpload').post(protect, uploadProfileImg);
router.route('/friends').get(protect, getFriends);
router
  .route('/:userId/recommendedInterest')
  .get(protect, getInterestRecommendation);
router
  .route('/friends/:userId')
  .patch(protect, addFriend)
  .delete(protect, deleteFriend);
router
  .route('/getFriendRecommendation')
  .get(protect, getFriendsRecommendationList);
router
  .route('/:id')
  .get(getUser)
  .patch(protect, updateUser);
// .delete(deleteUser);
router
  .route('/')
  .get(getUsers)
  .post(saveUser);

module.exports = router;
