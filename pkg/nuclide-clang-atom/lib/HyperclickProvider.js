function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _constants = require('./constants');

var _libclang = require('./libclang');

var _findWholeRangeOfSymbol = require('./findWholeRangeOfSymbol');

var _findWholeRangeOfSymbol2 = _interopRequireDefault(_findWholeRangeOfSymbol);

var IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;

module.exports = {
  // It is important that this has a lower priority than the handler from
  // fb-diffs-and-tasks.
  priority: 10,
  providerName: _constants.PACKAGE_NAME,
  wordRegExp: IDENTIFIER_REGEXP,
  getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
    if (text === '') {
      return null;
    }
    if (!_constants.GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var position = range.start;

    var result = yield (0, _libclang.getDeclaration)(textEditor, position.row, position.column);
    if (result) {
      var wholeRange = (0, _findWholeRangeOfSymbol2['default'])(textEditor, text, range, result.spelling, result.extent);
      return {
        range: wholeRange,
        callback: function callback() {
          return (0, _nuclideAtomHelpers.goToLocation)(result.file, result.line, result.column);
        }
      };
    } else {
      return null;
    }
  })
};