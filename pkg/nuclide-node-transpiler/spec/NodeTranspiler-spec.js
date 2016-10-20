#!/usr/bin/env node
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

/* eslint-disable no-console */

console.log(__filename);

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const NodeTranspiler = require('../lib/NodeTranspiler');

//---

console.log('NodeTranspiler.shouldCompile on Buffers and strings');

[
  "'use babel';\n",
  '"use babel";\n',
  '/* @flow */\n',
  '/** @babel */\n',
  new Buffer("'use babel';\n"),
  new Buffer('"use babel";\n'),
  new Buffer('/* @flow */\n'),
  new Buffer('/** @babel */\n'),
].forEach(src => {
  assert.ok(NodeTranspiler.shouldCompile(src));
});

[
  "'use strict';\n",
  'console.log("hello world");\n',
  new Buffer("'use strict';\n"),
  new Buffer('console.log("hello world");\n'),
].forEach(src => {
  assert.ok(!NodeTranspiler.shouldCompile(src));
});

//---

(() => {
  console.log('NodeTranspiler#getConfigDigest with real babel');

  const realBabel = require('babel-core');
  const nodeTranspilerReal = new NodeTranspiler();

  const fakeBabel = {
    version: realBabel.version,
    transform() { throw new Error('This should not have been called.'); },
  };
  const nodeTranspilerFake =
    new NodeTranspiler(fakeBabel.version, () => fakeBabel);

  assert.equal(
    nodeTranspilerReal.getConfigDigest(),
    nodeTranspilerFake.getConfigDigest()
  );
})();

//---

(() => {
  console.log('NodeTranspiler#transform with own babel');

  const filename = require.resolve('./fixtures/modern-syntax');
  const nodeTranspiler = new NodeTranspiler();

  // Works on buffers...

  const bufferSrc = fs.readFileSync(filename);
  assert.ok(Buffer.isBuffer(bufferSrc));

  const out1 = nodeTranspiler.transform(bufferSrc, filename);
  assert.ok(typeof out1 === 'string');

  const c1 = {exports: {}};
  vm.runInNewContext(out1, c1);
  assert.equal(c1.exports.Foo.bar, 'qux');

  // Works on strings...

  const stringSrc = bufferSrc.toString();
  assert.ok(typeof stringSrc === 'string');

  const out2 = nodeTranspiler.transform(stringSrc, filename);
  assert.ok(typeof out2 === 'string');

  const c2 = {exports: {}};
  vm.runInNewContext(out2, c2);
  assert.equal(c2.exports.Foo.bar, 'qux');
})();

//---

(() => {
  console.log('NodeTranspiler#_getCacheFilename');

  const filename = require.resolve('./fixtures/modern-syntax');
  const nodeTranspiler = new NodeTranspiler();

  const bufferSrc = fs.readFileSync(filename);
  assert.ok(Buffer.isBuffer(bufferSrc));

  // Works with buffers and strings...

  const cacheFilename1 =
    nodeTranspiler._getCacheFilename(bufferSrc, filename);
  const cacheFilename2 =
    nodeTranspiler._getCacheFilename(bufferSrc.toString(), filename);

  assert.equal(cacheFilename1, cacheFilename2);
})();

//---

(() => {
  console.log('NodeTranspiler#transformWithCache reads from the cache');

  const filename = require.resolve('./fixtures/modern-syntax');
  const nodeTranspiler = new NodeTranspiler();

  nodeTranspiler._getCacheFilename = src => {
    assert.equal(src, 'abc');
    return filename;
  };

  const out = nodeTranspiler.transformWithCache('abc', filename);
  const expected = fs.readFileSync(filename, 'utf8');

  assert.equal(out, expected);
})();
