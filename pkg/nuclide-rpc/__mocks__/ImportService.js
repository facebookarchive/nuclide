'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.f = f;
exports.f2 = f2;
exports.f3 = f3;
exports.g = g;
let _NonRpcDefinition = exports._NonRpcDefinition = undefined;

// We should be able to import types from non-rpc compatible files
// as long as they are not used in the external interface of the file.
// $FlowIgnore - Ignore the fact that the file doesn't exist.
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

async function f(t) {
  return t;
}

async function f2(t) {
  return t;
}

async function f3(t) {
  return t;
}

async function g(t) {
  return t.field;
}