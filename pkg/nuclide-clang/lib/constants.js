Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var GRAMMARS = ['source.c', 'source.cpp', 'source.objc', 'source.objcpp'];
exports.GRAMMARS = GRAMMARS;
var GRAMMAR_SET = new Set(GRAMMARS);

exports.GRAMMAR_SET = GRAMMAR_SET;
var PACKAGE_NAME = 'nuclide-clang';

exports.PACKAGE_NAME = PACKAGE_NAME;
var IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;
exports.IDENTIFIER_REGEXP = IDENTIFIER_REGEXP;