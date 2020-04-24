const express = require('express');
const { protect } = require('../controllers/authController');

const { getComments, addComment, updateComment, deleteComment } = require('../controllers/commentController')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getComments)
    .post(protect, addComment);
router
    .route('/:commentId')
    .patch(protect, updateComment)
    .delete(protect, deleteComment);

module.exports = router;
