const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    commentText: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true
    },
    createDate: { type: Date, default: Date.now() }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
