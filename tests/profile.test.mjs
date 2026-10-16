import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import React from '../client/node_modules/react/index.js'
import { act, create } from '../client/node_modules/react-test-renderer/index.js'
import { transformWithOxc } from '../client/node_modules/vite/dist/node/index.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const source = readFileSync(new URL('../client/src/pages/Profile.jsx', import.meta.url), 'utf8')
  .replace(/^import .+$/gm, '')
  .replace('import.meta.env.VITE_API_URL', 'undefined')
  .replace('export default Profile', 'globalThis.Profile = Profile')
const { code } = await transformWithOxc(source, 'Profile.jsx', { jsx: { runtime: 'classic' } })

test('profile button follows, unfollows, restores status, handles errors and hides on own profile', async () => {
  let profileId = 'target'
  let following = false
  let fail = false
  let unauthorized = false
  const removed = []
  const navigations = []
  const requests = []
  const axios = {}
  axios.post = async (url, body, options) => {
    requests.push({ url, ...options })
    if (unauthorized) throw { response: { status: 401, data: { message: 'Invalid or expired token' } } }
    if (fail) throw new Error('Offline')
    following = url.endsWith('/follow')
    return { data: { followerCount: following ? 1 : 0 } }
  }
  axios.get = async () => ({ data: { id: profileId, username: profileId, isFollowing: following, followerCount: following ? 1 : 0, followingCount: 0 } })
  const context = vm.createContext({
    React, useState: React.useState, useEffect: React.useEffect, axios,
    useParams: () => ({ id: profileId }), Link: ({ children }) => React.createElement('a', {}, children),
    useNavigate: () => (...args) => navigations.push(args),
    localStorage: {
      getItem: key => key === 'user' ? JSON.stringify({ id: 'viewer', username: 'viewer' }) : 'token',
      removeItem: key => removed.push(key),
    },
  })
  vm.runInContext(code, context)
  let renderer
  const mount = async () => { await act(async () => { renderer = create(React.createElement(context.Profile)) }) }
  const button = () => renderer.root.findByType('button')
  const click = async () => { await act(async () => { await button().props.onClick() }) }
  await mount()
  assert.equal(button().children.join(''), 'Follow')
  await click()
  assert.equal(button().children.join(''), 'Unfollow')
  assert.equal(requests[0].headers.Authorization, 'Bearer token')
  assert.match(requests[0].url, /\/target\/follow$/)
  assert.match(JSON.stringify(renderer.toJSON()), /"children":\["1"\]/)
  await act(async () => renderer.unmount())
  await mount()
  assert.equal(button().children.join(''), 'Unfollow')
  await click()
  assert.equal(button().children.join(''), 'Follow')
  assert.match(requests[1].url, /\/target\/unfollow$/)
  fail = true
  await click()
  assert.equal(button().children.join(''), 'Follow')
  assert.match(renderer.root.findByProps({ role: 'alert' }).children.join(''), /Unable to update/)
  unauthorized = true
  await click()
  assert.deepEqual(removed, ['token', 'user'])
  assert.equal(navigations[0][0], '/login')
  assert.equal(navigations[0][1].state.returnTo, '/profile/target')
  await act(async () => renderer.unmount())
  profileId = 'viewer'
  await mount()
  assert.equal(renderer.root.findAllByType('button').length, 0)
  await act(async () => renderer.unmount())
});
