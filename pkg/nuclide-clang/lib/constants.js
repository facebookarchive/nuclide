'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

const GRAMMARS = exports.GRAMMARS = ['source.c', 'source.cpp', 'source.objc', 'source.objcpp'];
const GRAMMAR_SET = exports.GRAMMAR_SET = new Set(GRAMMARS);

const PACKAGE_NAME = exports.PACKAGE_NAME = 'nuclide-clang';

const IDENTIFIER_REGEXP = exports.IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;