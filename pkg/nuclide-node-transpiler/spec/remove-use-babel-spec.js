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

/*eslint-disable no-console*/

console.log(__filename);

const assert = require('assert');
const babel = require('babel-core');

const transformer = require('../lib/remove-use-babel-tr');

//---

// Removes 'use babel', "use babel" and /** @babel */
assertTransformation(`\
'use babel';

module.exports = () => {};
`, `\
module.exports = function() {};
`);

assertTransformation(`\
"use babel";

module.exports = () => {};
`, `\
module.exports = function() {};
`);

assertTransformation(`\
/** @babel */

module.exports = () => {};
`, `\
/**/

module.exports = function() {};
`);

//---

// Ignores other things.
assertTransformation(`\
/* @babel */

module.exports = () => {};
`, `\
/* @babel */

module.exports = function() {};
`);

assertTransformation(`\
'use strict';

module.exports = () => {};
`, `\
'use strict';

module.exports = function() {};
`);

assertTransformation(`\
module.exports = () => {};

"use babel";
`, `\
module.exports = function() {};

"use babel";
`);

//---

function stripMeta(node) {
  delete node.start;
  delete node.end;
  // delete node.leadingComments;
  // delete node.trailingComments;
  delete node.raw;
  for (const p in node) {
    if (node[p] && typeof node[p] === 'object') {
      stripMeta(node[p]);
    }
  }
  return node;
}

function assertTransformation(source, expected) {
  const output = babel.transform(source, {
    plugins: [transformer],
    blacklist: ['strict'],
  }).code;
  assert.deepEqual(
    stripMeta(babel.parse(output)),
    stripMeta(babel.parse(expected))
  );
}
