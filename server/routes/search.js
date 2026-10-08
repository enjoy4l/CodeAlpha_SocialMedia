const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return res.status(200).json({ users: [], posts: [] });
    }

    const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [users, posts] = await Promise.all([
      User.find({ username: expression }).select('username avatar').limit(8),
      Post.find({ text: expression })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('author', 'username avatar'),
    ]);

    return res.status(200).json({ users, posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
