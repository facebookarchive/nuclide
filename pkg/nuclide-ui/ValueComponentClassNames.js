'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// A very basic heuristic for coloring the values.

Object.defineProperty(exports, "__esModule", {
  value: true
});

const ValueComponentClassNames = exports.ValueComponentClassNames = {
  string: 'string quoted double',
  stringOpeningQuote: 'punctuation definition string begin',
  stringClosingQuote: 'punctuation definition string end',
  number: 'constant numeric',
  nullish: 'constant language null',
  identifier: 'variable',
  boolean: 'constant language boolean'
};