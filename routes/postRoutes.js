const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getPosts,
  addPost,
  updatePost,
  getUserPosts,
  getRecommendPosts,
  deletePost,
  getPost
} = require('../controllers/postController');

const commentRoutes = require('../routes/commentRoutes');
const router = express.Router({ mergeParams: true });

router.get('/getRecommendPost', protect, getRecommendPosts);

router.use('/:postId/comments', commentRoutes);

router
  .route('/')
  .get(getUserPosts)
  .post(protect, addPost);
router
  .route('/:postId')
  .get(getPost)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
