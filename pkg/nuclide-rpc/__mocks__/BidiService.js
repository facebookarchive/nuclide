"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.f = f;

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
async function f(s, i) {
  const result = await i.m(s);
  i.dispose();
  return result;
}