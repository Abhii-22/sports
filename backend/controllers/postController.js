const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    const newPost = new Post({
      user: req.user.id,
      mediaUrl: `/uploads/${req.file.filename}`,
      title: req.body.title || '',
      mediaType: req.file.mimetype,
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all posts for a user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate('likedBy', '_id').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'name email profilePictureUrl').populate('likedBy', '_id').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user has already liked the post
    if (post.likedBy.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    // Add user to likedBy array and increment likes
    post.likedBy.push(req.user.id);
    post.likes += 1;
    await post.save();

    res.json({ likes: post.likes, liked: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user has liked the post
    const index = post.likedBy.indexOf(req.user.id);
    if (index === -1) {
      return res.status(400).json({ msg: 'Post not liked yet' });
    }

    // Remove user from likedBy array and decrement likes
    post.likedBy.splice(index, 1);
    post.likes -= 1;
    await post.save();

    res.json({ likes: post.likes, liked: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
