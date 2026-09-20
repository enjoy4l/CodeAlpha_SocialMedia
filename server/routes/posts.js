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
      .populate('author', 'username avatar');

    res.set('X-Feed-Mode', feedMode);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
