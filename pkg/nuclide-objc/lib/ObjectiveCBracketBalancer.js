var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomObserveLanguageTextEditors2;

function _commonsAtomObserveLanguageTextEditors() {
  return _commonsAtomObserveLanguageTextEditors2 = _interopRequireDefault(require('../../commons-atom/observe-language-text-editors'));
}

var GRAMMARS = ['source.objc', 'source.objcpp'];

/**
 * This closes square brackets for Objective-C message calls.
 * Clients must call `disable()` once they're done with an instance.
 */

var ObjectiveCBracketBalancer = (function () {
  function ObjectiveCBracketBalancer() {
    _classCallCheck(this, ObjectiveCBracketBalancer);
  }

  _createClass(ObjectiveCBracketBalancer, [{
    key: 'enable',
    value: function enable() {
      var _this = this;

      // The feature is already enabled.
      if (this._languageListener) {
        return;
      }

      this._editingSubscriptionsMap = new Map();
      this._languageListener = (0, (_commonsAtomObserveLanguageTextEditors2 || _commonsAtomObserveLanguageTextEditors()).default)(GRAMMARS, function (textEditor) {
        return _this._enableInTextEditor(textEditor);
      }, function (textEditor) {
        return _this._disableInTextEditor(textEditor);
      });
    }
  }, {
    key: 'disable',
    value: function disable() {
      // The feature is already disabled.
      if (!this._languageListener) {
        return;
      }
      this._languageListener.dispose();
      this._languageListener = null;

      this._editingSubscriptionsMap.forEach(function (subscription) {
        return subscription.dispose();
      });
      this._editingSubscriptionsMap.clear();
    }
  }, {
    key: '_enableInTextEditor',
    value: function _enableInTextEditor(textEditor) {
      var insertTextSubscription = textEditor.onDidInsertText(function (event) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('objc:balance-bracket', function () {
          var range = event.range;
          var text = event.text;

          if (text === ']') {
            var buffer = textEditor.getBuffer();
            var leftBracketInsertPosition = ObjectiveCBracketBalancer.getOpenBracketInsertPosition(buffer, range.start);
            if (leftBracketInsertPosition) {
              buffer.insert(leftBracketInsertPosition, '[');
            }
          }
        });
      });
      this._editingSubscriptionsMap.set(textEditor, insertTextSubscription);
    }
  }, {
    key: '_disableInTextEditor',
    value: function _disableInTextEditor(textEditor) {
      var subscription = this._editingSubscriptionsMap.get(textEditor);
      if (subscription) {
        subscription.dispose();
        this._editingSubscriptionsMap.delete(textEditor);
      }
    }
  }], [{
    key: 'getOpenBracketInsertPosition',
    value: function getOpenBracketInsertPosition(buffer, closeBracketPosition) {
      var closeBracketText = buffer.getTextInRange((_atom2 || _atom()).Range.fromObject([closeBracketPosition, closeBracketPosition.translate([0, 1])]));
      if (closeBracketText !== ']') {
        throw new Error('The close bracket position must contain a close bracket');
      }

      var startingLine = buffer.lineForRow(closeBracketPosition.row);
      var singleQuoteCount = 0;
      var doubleQuoteCount = 0;
      var characterCount = {
        '[': 0,
        ']': 0
      };

      // Iterate through the line, determining if we have balanced brackets.
      // We do not count brackets we encounter inside string/char literals.
      for (var i = 0; i < startingLine.length; i++) {
        if (startingLine[i] === '\'') {
          singleQuoteCount++;
        } else if (startingLine[i] === '"') {
          doubleQuoteCount++;
        } else {
          if (singleQuoteCount % 2 === 0 && doubleQuoteCount % 2 === 0) {
            // We are not inside a char nor string literal. Count the brackets.
            characterCount[startingLine[i]]++;
          }
        }
      }

      var stringLiteralMatch = /@".*"\s.*]/.exec(startingLine);
      if (stringLiteralMatch) {
        return (_atom2 || _atom()).Point.fromObject([closeBracketPosition.row, stringLiteralMatch.index]);
      } else if (characterCount['['] < characterCount[']']) {
        // Check if we're at the bottom of a multi-line method.
        var multiLineMethodRegex = /^[\s\w\[]*:.*[^;{];?$/;
        var currentRow = closeBracketPosition.row;
        var currentRowPlusOne = null;
        var match = multiLineMethodRegex.exec(buffer.lineForRow(currentRow));

        while (match !== null) {
          currentRowPlusOne = currentRow;
          match = multiLineMethodRegex.exec(buffer.lineForRow(--currentRow));
        }

        if (currentRowPlusOne !== null && currentRowPlusOne !== closeBracketPosition.row) {
          var targetLine = buffer.lineForRow(currentRowPlusOne);
          var targetMatch = /\S/.exec(targetLine);

          if (targetLine[targetMatch.index] === '[') {
            return null;
          } else {
            return (_atom2 || _atom()).Point.fromObject([currentRowPlusOne, targetMatch.index]);
          }
        } else {
          // We need a bracket on this line - at this point it's either
          // At the beginning, or after an `=`.
          var initMatch = /.*(=\s?)\S/.exec(startingLine);
          var startOfLineMatch = /\S/.exec(startingLine);
          var column = 0;

          if (initMatch && initMatch[1]) {
            var equalsMatchPosition = startingLine.lastIndexOf(initMatch[1]);
            column = equalsMatchPosition += initMatch[1].length;
          } else if (startOfLineMatch && startOfLineMatch.index) {
            column = startOfLineMatch.index;
          } else {
            column = 0;
          }

          return (_atom2 || _atom()).Point.fromObject([closeBracketPosition.row, column]);
        }
      } else {
        return null;
      }
    }
  }]);

  return ObjectiveCBracketBalancer;
})();

module.exports = ObjectiveCBracketBalancer;