'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.f = f;


// Use ImportedType from another file - testing, multiple
// imports the same file.
function f(x) {}

// Non-RPC compatible types are fine, as long as they're not used.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */

class C {}
exports.C = C;