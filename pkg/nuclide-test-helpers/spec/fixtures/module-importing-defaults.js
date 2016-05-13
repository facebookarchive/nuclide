'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// These must be imported using `import` so they're transpiled with the
// interop.
import cjsFunction from './module-cjs-function';
import defaultAndMembers from './module-default-and-members';
import oneDefault from './module-one-default';


// These must be exported on `module.exports` so they don't get changed by
// transpiling.
module.exports = {
  cjsFunction,
  defaultAndMembers,
  oneDefault,
};
