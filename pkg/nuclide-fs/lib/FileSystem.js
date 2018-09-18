"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.READFILE_SIZE_LIMIT = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Attempting to read large files just crashes node, so just fail.
// Atom can't handle files of this scale anyway.
const READFILE_SIZE_LIMIT = 10 * 1024 * 1024; // [localName, isFile, isSymbolicLink]

exports.READFILE_SIZE_LIMIT = READFILE_SIZE_LIMIT;