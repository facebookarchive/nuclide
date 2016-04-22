'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This file installs the logic that modifies Node's built in require()
 * function to transpile .js files that start with either `'use babel'` or
 * `"use babel"`.
 */

const assert = require('assert');
const fs = require('fs');

const NodeTranspiler = require('./NodeTranspiler');
const nodeTranspiler = new NodeTranspiler();

// Make sure we can add the require() hook.
const jsExtension = Object.getOwnPropertyDescriptor(require.extensions, '.js');

// In Atom, this is false - prevent accidental unnecessary use.
assert(jsExtension.writable);

Object.defineProperty(require.extensions, '.js', {
  enumerable: true,
  writable: false,
  value: function transpiler_require_hook(_module, filename) {
    // Keep src as a buffer so calculating its digest with crypto is fast.
    const src = fs.readFileSync(filename);

    let output;
    if (NodeTranspiler.shouldCompile(src)) {
      output = nodeTranspiler.transformWithCache(src, filename);
    } else {
      output = src.toString();
    }

    return _module._compile(output, filename);
  },
});
