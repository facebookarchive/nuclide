"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SUPPORTED_RULE_TYPES = exports.RUNNABLE_RULE_TYPES = void 0;

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
const RUNNABLE_RULE_TYPES = new Set(['apple_bundle']);
exports.RUNNABLE_RULE_TYPES = RUNNABLE_RULE_TYPES;
const SUPPORTED_RULE_TYPES = new Set([...RUNNABLE_RULE_TYPES, 'apple_library', 'apple_test']);
exports.SUPPORTED_RULE_TYPES = SUPPORTED_RULE_TYPES;