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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

// A heuristic for named variables in Hack.
// TODO: Replace RegExp with AST-based, more accurate approach.
var HACK_IDENTIFIER_REGEXP = /\$\w+/gi;

var HackEvaluationExpressionProvider = (function () {
  function HackEvaluationExpressionProvider() {
    _classCallCheck(this, HackEvaluationExpressionProvider);
  }

  _createClass(HackEvaluationExpressionProvider, [{
    key: 'getEvaluationExpression',
    value: function getEvaluationExpression(editor, position) {
      var extractedIdentifier = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, position, HACK_IDENTIFIER_REGEXP);
      if (extractedIdentifier == null) {
        return Promise.resolve(null);
      }
      var range = extractedIdentifier.range;
      var wordMatch = extractedIdentifier.wordMatch;

      var _wordMatch = _slicedToArray(wordMatch, 1);

      var expression = _wordMatch[0];

      if (expression == null) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        expression: expression,
        range: range
      });
    }
  }]);

  return HackEvaluationExpressionProvider;
})();

exports.HackEvaluationExpressionProvider = HackEvaluationExpressionProvider;