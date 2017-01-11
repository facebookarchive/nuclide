'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValueComponentClassNames = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO remove this once Atom 1.13 is the de-factor Atom version
function addSyntaxVariants(classNames) {
  return (0, (_classnames || _load_classnames()).default)(classNames, ...classNames.split(' ').map(name => `syntax--${ name }`));
}

// A very basic heuristic for coloring the values.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const ValueComponentClassNames = exports.ValueComponentClassNames = {
  string: addSyntaxVariants('string quoted double'),
  stringOpeningQuote: addSyntaxVariants('punctuation definition string begin'),
  stringClosingQuote: addSyntaxVariants('punctuation definition string end'),
  number: addSyntaxVariants('constant numeric'),
  nullish: addSyntaxVariants('constant language null'),
  identifier: addSyntaxVariants('variable'),
  boolean: addSyntaxVariants('constant language boolean')
};