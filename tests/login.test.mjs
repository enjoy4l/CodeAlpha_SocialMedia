import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import React from '../client/node_modules/react/index.js'
import { act, create } from '../client/node_modules/react-test-renderer/index.js'
import { transformWithOxc } from '../client/node_modules/vite/dist/node/index.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const source = readFileSync(new URL('../client/src/pages/Login.jsx', import.meta.url), 'utf8')
  .replace(/^import .+$/gm, '')
  .replace('import.meta.env.VITE_API_URL', 'undefined')
  .replace('export default Login', 'globalThis.Login = Login')
const { code } = await transformWithOxc(source, 'Login.jsx', { jsx: { runtime: 'classic' } })

test('login replaces rejected credentials and returns to the requested profile', async () => {
  const saved = new Map()
  const navigations = []
  const context = vm.createContext({
    React, useState: React.useState,
    axios: { post: async () => ({ data: { token: 'fresh-token', user: { id: 'viewer' } } }) },
    useNavigate: () => (...args) => navigations.push(args),
    useLocation: () => ({ state: { returnTo: '/profile/target', message: 'Please log in again.' } }),
    Link: ({ children }) => React.createElement('a', {}, children),
    localStorage: { setItem: (key, value) => saved.set(key, value) },
  })
  vm.runInContext(code, context)
  let renderer
  await act(async () => { renderer = create(React.createElement(context.Login)) })
  assert.equal(renderer.root.findByProps({ role: 'status' }).children.join(''), 'Please log in again.')
  await act(async () => {
    await renderer.root.findByType('form').props.onSubmit({ preventDefault() {} })
  })
  assert.equal(saved.get('token'), 'fresh-token')
  assert.equal(JSON.parse(saved.get('user')).id, 'viewer')
  assert.equal(navigations[0][0], '/profile/target')
  await act(async () => renderer.unmount())
})
