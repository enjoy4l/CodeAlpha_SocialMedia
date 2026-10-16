const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const routes = require('../routes/users');

test('restored follow API persists both sides and enforces access', async () => {
  const original = { findById: User.findById };
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'follow-test-secret';
  const users = {
    viewer: { _id: 'viewer', followers: [], following: [] },
    target: { _id: 'target', followers: [], following: [] },
  };
  for (const user of Object.values(users)) user.save = async () => user;
  User.findById = id => {
    const promise = Promise.resolve(users[id]);
    promise.select = () => promise;
    return promise;
  };
  const app = express();
  app.use('/api/users', routes);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const token = jwt.sign({ id: 'viewer' }, process.env.JWT_SECRET);
  const request = (path, method = 'GET', authenticated = true) => fetch(
    `http://127.0.0.1:${server.address().port}/api/users/${path}`,
    { method, headers: authenticated ? { Authorization: `Bearer ${token}` } : {} },
  );
  try {
    for (const invalidToken of [
      jwt.sign({ id: 'viewer' }, process.env.JWT_SECRET, { expiresIn: -1 }),
      jwt.sign({ id: 'viewer' }, 'wrong-secret'),
    ]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/users/target/follow`, {
        method: 'POST', headers: { Authorization: `Bearer ${invalidToken}` },
      });
      assert.equal(response.status, 401);
      assert.deepEqual(users.target.followers, []);
    }
    assert.equal((await request('target/follow', 'POST', false)).status, 401);
    const publicProfile = await request('target', 'GET', false);
    assert.equal(publicProfile.status, 200);
    assert.equal('isFollowing' in await publicProfile.json(), false);
    assert.equal((await request('target/unfollow', 'POST', false)).status, 401);
    assert.equal((await request('viewer/follow', 'POST')).status, 400);
    assert.equal((await request('viewer/unfollow', 'POST')).status, 400);
    assert.equal((await request('missing/follow', 'POST')).status, 404);
    assert.equal((await (await request('target')).json()).isFollowing, false);
    assert.deepEqual(await (await request('target/follow', 'POST')).json(), { followerCount: 1, followingCount: 1 });
    assert.equal((await request('target/follow', 'POST')).status, 400);
    assert.deepEqual(users.viewer.following, ['target']);
    assert.deepEqual(users.target.followers, ['viewer']);
    assert.equal((await (await request('target')).json()).isFollowing, true);
    for (let i = 0; i < 2; i++) {
      assert.deepEqual(await (await request('target/unfollow', 'POST')).json(), { followerCount: 0, followingCount: 0 });
    }
    assert.deepEqual(users.viewer.following, []);
    assert.deepEqual(users.target.followers, []);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    Object.assign(User, original);
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
