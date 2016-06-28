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

var GRAMMAR_SET = new Set(['source.python']);
exports.GRAMMAR_SET = GRAMMAR_SET;
var PACKAGE_NAME = 'nuclide-python';
exports.PACKAGE_NAME = PACKAGE_NAME;
// Type mappings between Jedi types and autocomplete-plus types used for styling.
var TYPES = {
  module: 'import',
  'class': 'class',
  instance: 'variable',
  'function': 'function',
  generator: 'generator',
  statement: 'variable',
  'import': 'import',
  param: 'variable',
  property: 'property'
};
exports.TYPES = TYPES;