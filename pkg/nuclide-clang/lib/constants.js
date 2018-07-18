"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HEADER_DEFAULT_FLAGS_WARNING = exports.DEFAULT_FLAGS_WARNING = exports.IDENTIFIER_REGEXP = exports.PACKAGE_NAME = exports.GRAMMAR_SET = exports.GRAMMARS = void 0;

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
const GRAMMARS = ['source.c', 'source.cpp', 'source.objc', 'source.objcpp'];
exports.GRAMMARS = GRAMMARS;
const GRAMMAR_SET = new Set(GRAMMARS);
exports.GRAMMAR_SET = GRAMMAR_SET;
const PACKAGE_NAME = 'nuclide-clang';
exports.PACKAGE_NAME = PACKAGE_NAME;
const IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;
exports.IDENTIFIER_REGEXP = IDENTIFIER_REGEXP;
const DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Build this file with Buck, create a compile_commands.json file, then try "Clean and Rebuild".';
exports.DEFAULT_FLAGS_WARNING = DEFAULT_FLAGS_WARNING;
const HEADER_DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Note that header files only have compilation flags if a source file nearby has the same name or includes it. ' + 'Include this file from a source file built by Buck, or create a compile_commands.json file, then try "Clean and Rebuild".';
exports.HEADER_DEFAULT_FLAGS_WARNING = HEADER_DEFAULT_FLAGS_WARNING;