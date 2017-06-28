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

// A very basic heuristic for coloring the values.
/* eslint-disable key-spacing */
const ValueComponentClassNames = exports.ValueComponentClassNames = {
  boolean: 'syntax--constant syntax--language syntax--boolean',
  identifier: 'syntax--variable',
  nullish: 'syntax--constant syntax--language syntax--null',
  number: 'syntax--constant syntax--numeric',
  string: 'syntax--string syntax--quoted syntax--double',
  stringClosingQuote: 'syntax--punctuation syntax--definition syntax--string syntax--end',
  stringOpeningQuote: 'syntax--punctuation syntax--definition syntax--string syntax--begin'
};
/* eslint-enable key-spacing */