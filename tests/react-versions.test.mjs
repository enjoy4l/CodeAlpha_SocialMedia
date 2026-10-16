import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

test('React and its renderers use the same exact version locally and in the lockfile', () => {
  const manifest = require('../client/package.json')
  const lock = require('../client/package-lock.json')
  const version = manifest.dependencies.react
  assert.match(version, /^\d+\.\d+\.\d+$/)
  for (const name of ['react', 'react-dom', 'react-test-renderer']) {
    assert.equal((manifest.dependencies[name] || manifest.devDependencies[name]), version, name)
    assert.equal(lock.packages[`node_modules/${name}`].version, version, name)
    assert.equal(require(`../client/node_modules/${name}/package.json`).version, version, name)
  }
  // Loading the production renderer catches incompatible React versions at startup.
  assert.doesNotThrow(() => require('../client/node_modules/react-dom/server'))
})
