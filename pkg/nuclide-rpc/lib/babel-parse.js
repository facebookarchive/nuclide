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

exports.default = babelParse;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _babelCoreLibHelpersParse2;

function _babelCoreLibHelpersParse() {
  return _babelCoreLibHelpersParse2 = _interopRequireDefault(require('babel-core/lib/helpers/parse'));
}

var BABYLON_OPTIONS = {
  allowHashBang: true,
  sourceType: 'module',
  ecmaVersion: Infinity,
  features: {
    'es7.asyncFunctions': true,
    'es7.classProperties': true,
    'es7.comprehensions': true,
    'es7.decorators': true,
    'es7.doExpressions': true,
    'es7.exponentiationOperator': true,
    'es7.exportExtensions': true,
    'es7.functionBind': true,
    'es7.objectRestSpread': true,
    'es7.trailingFunctionCommas': true
  },
  plugins: {
    jsx: true,
    flow: true
  }
};

function babelParse(source) {
  var ast = (0, (_babelCoreLibHelpersParse2 || _babelCoreLibHelpersParse()).default)(source, BABYLON_OPTIONS);
  if (ast.program && ast.program.type === 'Program') {
    return ast.program;
  } else {
    return null;
  }
}

module.exports = exports.default;