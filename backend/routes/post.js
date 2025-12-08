const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createPost, getUserPosts, getAllPosts, likePost, unlikePost } = require('../controllers/postController');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, upload.single('media')], createPost);

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', getAllPosts);

// @route   GET api/posts/user/:userId
// @desc    Get all posts for a user
// @access  Public
router.get('/user/:userId', getUserPosts);

// @route   PUT api/posts/:postId/like
// @desc    Like a post
// @access  Private
router.put('/:postId/like', auth, likePost);

// @route   PUT api/posts/:postId/unlike
// @desc    Unlike a post
// @access  Private
router.put('/:postId/unlike', auth, unlikePost);

module.exports = router;
