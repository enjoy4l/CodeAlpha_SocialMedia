const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followerCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
