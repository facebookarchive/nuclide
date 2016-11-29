'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

const GRAMMAR_SET = exports.GRAMMAR_SET = new Set(['source.python']);
const PACKAGE_NAME = exports.PACKAGE_NAME = 'nuclide-python';
// Type mappings between Jedi types and autocomplete-plus types used for styling.
const TYPES = exports.TYPES = {
  module: 'import',
  class: 'class',
  instance: 'variable',
  function: 'function',
  generator: 'generator',
  statement: 'variable',
  import: 'import',
  param: 'variable',
  property: 'property'
};