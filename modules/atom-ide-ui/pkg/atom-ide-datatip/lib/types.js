"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModifierKeys = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * Consumers of the "datatip" service get an instance of this service.
 * You can register providers (which will be triggered on mouseover) or manually
 * create pinned datatips on-demand.
 */
// Borrowed from the LSP API.
const ModifierKeys = Object.freeze({
  META: 'metaKey',
  SHIFT: 'shiftKey',
  ALT: 'altKey',
  CTRL: 'ctrlKey'
});
exports.ModifierKeys = ModifierKeys;