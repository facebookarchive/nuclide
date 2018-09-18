"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PACKAGE_NAME = exports.GRAMMAR_SET = exports.GRAMMARS = void 0;

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
const GRAMMARS = ['source.python', 'python'];
exports.GRAMMARS = GRAMMARS;
const GRAMMAR_SET = new Set(GRAMMARS);
exports.GRAMMAR_SET = GRAMMAR_SET;
const PACKAGE_NAME = 'nuclide-python';
exports.PACKAGE_NAME = PACKAGE_NAME;