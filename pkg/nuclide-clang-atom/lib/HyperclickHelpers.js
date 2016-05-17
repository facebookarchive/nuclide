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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var _findWholeRangeOfSymbol2;

function _findWholeRangeOfSymbol() {
  return _findWholeRangeOfSymbol2 = _interopRequireDefault(require('./findWholeRangeOfSymbol'));
}

var HyperclickHelpers = (function () {
  function HyperclickHelpers() {
    _classCallCheck(this, HyperclickHelpers);
  }

  _createClass(HyperclickHelpers, null, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      if (text === '') {
        return null;
      }
      if (!(_constants2 || _constants()).GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
        return null;
      }

      var position = range.start;

      var result = yield (0, (_libclang2 || _libclang()).getDeclaration)(textEditor, position.row, position.column);
      if (result) {
        var wholeRange = (0, (_findWholeRangeOfSymbol2 || _findWholeRangeOfSymbol()).default)(textEditor, text, range, result.spelling, result.extent);
        return {
          range: wholeRange,
          callback: function callback() {
            return (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(result.file, result.line, result.column);
          }
        };
      } else {
        return null;
      }
    })
  }]);

  return HyperclickHelpers;
})();

exports.default = HyperclickHelpers;
module.exports = exports.default;