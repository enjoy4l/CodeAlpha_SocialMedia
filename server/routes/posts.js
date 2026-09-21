const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { text, image } = req.body;
    const post = await Post.create({
      author: req.user.id,
      text,
      image,
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIndex = post.likes.findIndex((userId) => userId.toString() === req.user.id);
    if (userIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(userIndex, 1);
    }

    await post.save();
    return res.status(200).json({
      likeCount: post.likes.length,
      liked: userIndex === -1,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(500).json({ message: error.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date(),
    });
    await post.save();
    await post.populate('comments.user', 'username avatar');

    return res.status(200).json(post.comments);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(500).json({ message: error.message });
  }
});

router.get('/', auth.optional, async (req, res) => {
  try {
    let query = {};
    let feedMode = 'global';

    if (req.user) {
      const user = await User.findById(req.user.id).select('following');
      const followingIds = user?.following || [];

      if (followingIds.length > 0) {
        query = { author: { $in: [...followingIds, req.user.id] } };
        feedMode = 'following';
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.set('X-Feed-Mode', feedMode);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
