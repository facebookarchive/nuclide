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

// The indentation amount depends on previous lines. If the user types a colon outside of a method
// call, it searches the entire buffer. This hard cutoff should work for sane code.
var NUMBER_OF_PREVIOUS_LINES_TO_SEARCH_FOR_COLONS = 25;

/**
 * This provides improved Objective-C indentation by aligning colons.
 * Clients must call `disable()` once they're done with an instance.
 */

var ObjectiveCColonIndenter = (function () {
  function ObjectiveCColonIndenter() {
    _classCallCheck(this, ObjectiveCColonIndenter);
  }

  _createClass(ObjectiveCColonIndenter, [{
    key: 'enable',
    value: function enable() {
      var _this = this;

      if (this._subscriptions) {
        return;
      }
      this._insertTextSubscriptionsMap = new Map();

      var subscriptions = this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
      subscriptions.add({ dispose: function dispose() {
          _this._insertTextSubscriptionsMap.forEach(function (subscription) {
            return subscription.dispose();
          });
          _this._insertTextSubscriptionsMap.clear();
        } });

      subscriptions.add((0, (_commonsAtomObserveLanguageTextEditors2 || _commonsAtomObserveLanguageTextEditors()).default)(GRAMMARS, function (textEditor) {
        return _this._enableInTextEditor(textEditor);
      }, function (textEditor) {
        return _this._disableInTextEditor(textEditor);
      }));
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
    }
  }, {
    key: '_enableInTextEditor',
    value: function _enableInTextEditor(textEditor) {
      this._insertTextSubscriptionsMap.set(textEditor, textEditor.onDidInsertText(function (event) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('objc:indent-colon', function () {
          var range = event.range;
          var text = event.text;

          // Ignore the inserted text if the user is typing in a string or comment.
          //
          // The scope descriptor marks the text with semantic information,
          // generally used for syntax highlighting.
          var isNonCodeText = textEditor.scopeDescriptorForBufferPosition(range.start).getScopesArray().some(function (scope) {
            return scope.startsWith('string') || scope.startsWith('comment');
          });
          if (text !== ':' || isNonCodeText) {
            return;
          }

          var buffer = textEditor.getBuffer();

          var currentColonPosition = range.start;
          var colonColumn = ObjectiveCColonIndenter.getIndentedColonColumn(buffer, currentColonPosition);
          if (!colonColumn) {
            return;
          }

          // Fully replace the current line with the properly-indented line.
          //
          // 1. Get the current line and strip all the indentation.
          var line = buffer.lineForRow(currentColonPosition.row);
          var unindentedLine = line.trimLeft();
          // 2. Calculate the amount of indentation the line should end up with.
          var numberOfIndentCharacters = line.length - unindentedLine.length;
          var unindentedCurrentColonColumn = currentColonPosition.column - numberOfIndentCharacters;
          var totalIndentAmount = unindentedCurrentColonColumn >= colonColumn ? 0 : colonColumn - unindentedCurrentColonColumn;
          // 3. Replace the current line with the properly-indented line.
          textEditor.setTextInBufferRange(buffer.rangeForRow(currentColonPosition.row, /* includeNewline */false), ' '.repeat(totalIndentAmount) + unindentedLine);

          // Move the cursor to right after the inserted colon.
          var newCursorPosition = [currentColonPosition.row, totalIndentAmount + unindentedCurrentColonColumn + 1];
          textEditor.setCursorBufferPosition(newCursorPosition);
          textEditor.scrollToBufferPosition(newCursorPosition);
        });
      }));
    }
  }, {
    key: '_disableInTextEditor',
    value: function _disableInTextEditor(textEditor) {
      var subscription = this._insertTextSubscriptionsMap.get(textEditor);
      if (subscription) {
        subscription.dispose();
        this._insertTextSubscriptionsMap.delete(textEditor);
      }
    }

    /**
     * Return the column of the colon to align with, or null if it doesn't exist.
     */
  }], [{
    key: 'getIndentedColonColumn',
    value: function getIndentedColonColumn(buffer, startPosition) {
      var startPositionText = buffer.getTextInRange((_atom2 || _atom()).Range.fromObject([startPosition, startPosition.translate([0, 1])]));
      if (startPositionText !== ':') {
        throw new Error('The start position must contain a colon, found \'' + startPositionText + '\' instead');
      }

      // Look for the first colon after the start of the current method.
      //
      // The general approach is to iterate backwards, checking key characters.
      // We keep track of the last colon that we see (i.e. the colon that is
      // closest to the beginning of the document) and terminate once we've
      // reached the start of the method.
      //
      // This doesn't work if there are strings/comments that contain `:`.
      var column = null;
      var numberOfUnclosedBrackets = 0;
      buffer.backwardsScanInRange(
      // Only stop at the key characters: `:[]+-`.
      /:|\[|\]|\+|-/g, (_atom2 || _atom()).Range.fromObject([startPosition.translate([-NUMBER_OF_PREVIOUS_LINES_TO_SEARCH_FOR_COLONS, 0]), startPosition.translate([0, -1])]), function (_ref) {
        var match = _ref.match;
        var matchText = _ref.matchText;
        var range = _ref.range;
        var stop = _ref.stop;

        var position = range.start;
        // If we find a key character on the starting line, then the user is
        // typing a single-line method (it doesn't need to be indented).
        var isSingleLineMethod = position.row === startPosition.row;
        // `+` or `-` means we've reached the start of a method declaration.
        var isDeclaration = matchText === '+' || matchText === '-';
        if (isSingleLineMethod || isDeclaration) {
          stop();
          return;
        }

        // Unbalanced brackets mean we've reached the start of a method call.
        if (matchText === '[') {
          numberOfUnclosedBrackets--;
        } else if (matchText === ']') {
          numberOfUnclosedBrackets++;
        }
        if (numberOfUnclosedBrackets === -1) {
          stop();
          return;
        }

        // Keep track of the last colon that we see.
        if (matchText === ':') {
          column = position.column;
        }
      });
      return column;
    }
  }]);

  return ObjectiveCColonIndenter;
})();

module.exports = ObjectiveCColonIndenter;