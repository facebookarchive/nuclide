'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.READFILE_SIZE_LIMIT = undefined;

var _fs = _interopRequireDefault(require('fs'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Attempting to read large files just crashes node, so just fail.
// Atom can't handle files of this scale anyway.
const READFILE_SIZE_LIMIT = exports.READFILE_SIZE_LIMIT = 10 * 1024 * 1024;

// [localName, isFile, isSymbolicLink]
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/**
 * This code implements the NuclideFs service.  It exports the FS on http via
 * the endpoint: http://your.server:your_port/fs/method where method is one of
 * readFile, writeFile, etc.
 */