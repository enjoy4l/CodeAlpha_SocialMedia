const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:id', auth.optional, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = req.user
      ? user.followers.some((followerId) => followerId.toString() === req.user.id)
      : undefined;
    const response = {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followerCount: user.followers.length,
      followingCount: user.following.length,
    };

    if (req.user) {
      response.isFollowing = isFollowing;
    }

    return res.status(200).json(response);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(500).json({ message: error.message });
  }
});

router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(req.user.id),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyFollowing = targetUser.followers.some(
      (followerId) => followerId.toString() === req.user.id,
    );
    if (alreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    targetUser.followers.push(currentUser._id);
    currentUser.following.push(targetUser._id);
    await Promise.all([targetUser.save(), currentUser.save()]);

    return res.status(200).json({
      followerCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(req.user.id),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    targetUser.followers = targetUser.followers.filter(
      (followerId) => followerId.toString() !== req.user.id,
    );
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== req.params.id,
    );
    await Promise.all([targetUser.save(), currentUser.save()]);

    return res.status(200).json({
      followerCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
