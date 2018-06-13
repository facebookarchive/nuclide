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
 *  strict
 * @format
 */

const GRAMMARS = exports.GRAMMARS = ['source.c', 'source.cpp', 'source.objc', 'source.objcpp'];
const GRAMMAR_SET = exports.GRAMMAR_SET = new Set(GRAMMARS);

const PACKAGE_NAME = exports.PACKAGE_NAME = 'nuclide-clang';

const IDENTIFIER_REGEXP = exports.IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;

const DEFAULT_FLAGS_WARNING = exports.DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Build this file with Buck, create a compile_commands.json file, then try "Clean and Rebuild".';

const HEADER_DEFAULT_FLAGS_WARNING = exports.HEADER_DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Note that header files only have compilation flags if a source file nearby has the same name or includes it. ' + 'Include this file from a source file built by Buck, or create a compile_commands.json file, then try "Clean and Rebuild".';