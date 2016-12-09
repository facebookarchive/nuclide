#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 */
'use strict';

/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

/* eslint-disable no-console */

console.log(__filename);

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const dedent = require('dedent');

const NodeTranspiler = require('../lib/NodeTranspiler');

//---

console.log('NodeTranspiler.shouldCompile on Buffers and strings');

[
  '/** @flow */\n',
  dedent`
    /**
     * @flow
     */
  `,
  dedent`
    /**
     * @foo
     * @flow
     */
  `,
].forEach(src => {
  assert.ok(NodeTranspiler.shouldCompile(src));
  assert.ok(NodeTranspiler.shouldCompile(new Buffer(src)));
});

[
  "'use strict';\n",
  '/** @fflow */\n',
  '/** flow */\n',
  dedent`
    'use strict';
    /**
     * @flow
     */
  `,
  dedent`
    'use strict';
    /**
     * @flow
     */
  `,
  // You have to strip your own shebang before the docblock is parsed!
  dedent`
    #!/usr/bin/env node
    /**
     * @flow
     */
  `,
].forEach(src => {
  assert.ok(!NodeTranspiler.shouldCompile(src));
  assert.ok(!NodeTranspiler.shouldCompile(new Buffer(src)));
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
