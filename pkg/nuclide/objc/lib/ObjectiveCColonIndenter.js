var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../analytics');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Range = _require.Range;

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

      var subscriptions = this._subscriptions = new CompositeDisposable();
      subscriptions.add({ dispose: function dispose() {
          _this._insertTextSubscriptionsMap.forEach(function (subscription) {
            return subscription.dispose();
          });
          _this._insertTextSubscriptionsMap.clear();
        } });

      var _require2 = require('../../atom-helpers');

      var observeLanguageTextEditors = _require2.observeLanguageTextEditors;

      subscriptions.add(observeLanguageTextEditors(GRAMMARS, function (textEditor) {
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
        (0, _analytics.trackOperationTiming)('objc:indent-colon', function () {
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
          // $FlowIssue This needs to be added to lib/core.js.
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
        this._insertTextSubscriptionsMap['delete'](textEditor);
      }
    }

    /**
     * Return the column of the colon to align with, or null if it doesn't exist.
     */
  }], [{
    key: 'getIndentedColonColumn',
    value: function getIndentedColonColumn(buffer, startPosition) {
      var startPositionText = buffer.getTextInRange(Range.fromObject([startPosition, startPosition.translate([0, 1])]));
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
      /:|\[|\]|\+|-/g, Range.fromObject([startPosition.translate([-NUMBER_OF_PREVIOUS_LINES_TO_SEARCH_FOR_COLONS, 0]), startPosition.translate([0, -1])]), function (_ref) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7eUJBWW1DLGlCQUFpQjs7Ozs7Ozs7OztlQURmLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdDLG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFHakMsSUFBTSxRQUFRLEdBQUcsQ0FDZixhQUFhLEVBQ2IsZUFBZSxDQUNoQixDQUFDOzs7O0FBSUYsSUFBTSw2Q0FBNkMsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7SUFNbkQsdUJBQXVCO1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzs7ZUFBdkIsdUJBQXVCOztXQUlyQixrQkFBUzs7O0FBQ2IsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUU3QyxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUN0RSxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFDLE9BQU8sRUFBRSxtQkFBTTtBQUNoQyxnQkFBSywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsVUFBQyxZQUFZO21CQUFLLFlBQVksQ0FBQyxPQUFPLEVBQUU7V0FBQSxDQUFDLENBQUM7QUFDbkYsZ0JBQUssMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDMUMsRUFBQyxDQUFDLENBQUM7O3NCQUVpQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7O1VBQTNELDBCQUEwQixhQUExQiwwQkFBMEI7O0FBQ2pDLG1CQUFhLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUN4QyxRQUFRLEVBQ1IsVUFBQSxVQUFVO2VBQUksTUFBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxFQUNsRCxVQUFBLFVBQVU7ZUFBSSxNQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0tBQzNEOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO09BQzVCO0tBQ0Y7OztXQUVrQiw2QkFBQyxVQUFzQixFQUFRO0FBQ2hELFVBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDckYsNkNBQ0UsbUJBQW1CLEVBQ25CLFlBQU07Y0FDRyxLQUFLLEdBQVUsS0FBSyxDQUFwQixLQUFLO2NBQUUsSUFBSSxHQUFJLEtBQUssQ0FBYixJQUFJOzs7Ozs7QUFNbEIsY0FBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FDM0UsY0FBYyxFQUFFLENBQ2hCLElBQUksQ0FBQyxVQUFBLEtBQUs7bUJBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztXQUFBLENBQUMsQ0FBQztBQUM1RSxjQUFJLElBQUksS0FBSyxHQUFHLElBQUksYUFBYSxFQUFFO0FBQ2pDLG1CQUFPO1dBQ1I7O0FBRUQsY0FBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUV0QyxjQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDekMsY0FBTSxXQUFXLEdBQ2pCLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBQzdFLGNBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEIsbUJBQU87V0FDUjs7Ozs7QUFLRCxjQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV6RCxjQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRXZDLGNBQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO0FBQ3JFLGNBQU0sNEJBQTRCLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxHQUFHLHdCQUF3QixDQUFDO0FBQzVGLGNBQU0saUJBQWlCLEdBQUcsNEJBQTRCLElBQUksV0FBVyxHQUNqRSxDQUFDLEdBQ0QsV0FBVyxHQUFHLDRCQUE0QixDQUFDOztBQUUvQyxvQkFBVSxDQUFDLG9CQUFvQixDQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsc0JBQXVCLEtBQUssQ0FBQyxFQUN4RSxHQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7OztBQUdsRCxjQUFNLGlCQUFpQixHQUFHLENBQ3hCLG9CQUFvQixDQUFDLEdBQUcsRUFDeEIsaUJBQWlCLEdBQUcsNEJBQTRCLEdBQUcsQ0FBQyxDQUNyRCxDQUFDO0FBQ0Ysb0JBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3RELG9CQUFVLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN0RCxDQUNGLENBQUM7T0FDSCxDQUFDLENBQUMsQ0FBQztLQUNMOzs7V0FFbUIsOEJBQUMsVUFBc0IsRUFBUTtBQUNqRCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3RFLFVBQUksWUFBWSxFQUFFO0FBQ2hCLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsWUFBSSxDQUFDLDJCQUEyQixVQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDckQ7S0FDRjs7Ozs7OztXQUs0QixnQ0FBQyxNQUF1QixFQUFFLGFBQXlCLEVBQVc7QUFDekYsVUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQzVELENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RCxVQUFJLGlCQUFpQixLQUFLLEdBQUcsRUFBRTtBQUM3QixjQUFNLElBQUksS0FBSyx1REFDc0MsaUJBQWlCLGdCQUFZLENBQUM7T0FDcEY7Ozs7Ozs7Ozs7QUFVRCxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSx3QkFBd0IsR0FBRyxDQUFDLENBQUM7QUFDakMsWUFBTSxDQUFDLG9CQUFvQjs7QUFFdkIscUJBQWUsRUFDZixLQUFLLENBQUMsVUFBVSxDQUFDLENBQ2YsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsNkNBQTZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDNUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2pDLENBQUMsRUFDRixVQUFDLElBQStCLEVBQUs7WUFBbkMsS0FBSyxHQUFOLElBQStCLENBQTlCLEtBQUs7WUFBRSxTQUFTLEdBQWpCLElBQStCLENBQXZCLFNBQVM7WUFBRSxLQUFLLEdBQXhCLElBQStCLENBQVosS0FBSztZQUFFLElBQUksR0FBOUIsSUFBK0IsQ0FBTCxJQUFJOztBQUM3QixZQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDOzs7QUFHN0IsWUFBTSxrQkFBa0IsR0FBSSxRQUFRLENBQUMsR0FBRyxLQUFLLGFBQWEsQ0FBQyxHQUFHLEFBQUMsQ0FBQzs7QUFFaEUsWUFBTSxhQUFhLEdBQUksU0FBUyxLQUFLLEdBQUcsSUFBSSxTQUFTLEtBQUssR0FBRyxBQUFDLENBQUM7QUFDL0QsWUFBSSxrQkFBa0IsSUFBSSxhQUFhLEVBQUU7QUFDdkMsY0FBSSxFQUFFLENBQUM7QUFDUCxpQkFBTztTQUNSOzs7QUFHRCxZQUFJLFNBQVMsS0FBSyxHQUFHLEVBQUU7QUFDckIsa0NBQXdCLEVBQUUsQ0FBQztTQUM1QixNQUFNLElBQUksU0FBUyxLQUFLLEdBQUcsRUFBRTtBQUM1QixrQ0FBd0IsRUFBRSxDQUFDO1NBQzVCO0FBQ0QsWUFBSSx3QkFBd0IsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNuQyxjQUFJLEVBQUUsQ0FBQztBQUNQLGlCQUFPO1NBQ1I7OztBQUdELFlBQUksU0FBUyxLQUFLLEdBQUcsRUFBRTtBQUNuQixnQkFBTSxHQUFJLFFBQVEsQ0FBbEIsTUFBTTtTQUNUO09BQ0YsQ0FBQyxDQUFDO0FBQ1AsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBdkpHLHVCQUF1Qjs7O0FBMEo3QixNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6Ik9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IEdSQU1NQVJTID0gW1xuICAnc291cmNlLm9iamMnLFxuICAnc291cmNlLm9iamNwcCcsXG5dO1xuXG4vLyBUaGUgaW5kZW50YXRpb24gYW1vdW50IGRlcGVuZHMgb24gcHJldmlvdXMgbGluZXMuIElmIHRoZSB1c2VyIHR5cGVzIGEgY29sb24gb3V0c2lkZSBvZiBhIG1ldGhvZFxuLy8gY2FsbCwgaXQgc2VhcmNoZXMgdGhlIGVudGlyZSBidWZmZXIuIFRoaXMgaGFyZCBjdXRvZmYgc2hvdWxkIHdvcmsgZm9yIHNhbmUgY29kZS5cbmNvbnN0IE5VTUJFUl9PRl9QUkVWSU9VU19MSU5FU19UT19TRUFSQ0hfRk9SX0NPTE9OUyA9IDI1O1xuXG4vKipcbiAqIFRoaXMgcHJvdmlkZXMgaW1wcm92ZWQgT2JqZWN0aXZlLUMgaW5kZW50YXRpb24gYnkgYWxpZ25pbmcgY29sb25zLlxuICogQ2xpZW50cyBtdXN0IGNhbGwgYGRpc2FibGUoKWAgb25jZSB0aGV5J3JlIGRvbmUgd2l0aCBhbiBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIge1xuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcDogTWFwPFRleHRFZGl0b3IsIGF0b20kRGlzcG9zYWJsZT47XG5cbiAgZW5hYmxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKHtkaXNwb3NlOiAoKSA9PiB7XG4gICAgICB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkpO1xuICAgICAgdGhpcy5faW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXAuY2xlYXIoKTtcbiAgICB9fSk7XG5cbiAgICBjb25zdCB7b2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnN9ID0gcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJyk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQob2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnMoXG4gICAgICAgIEdSQU1NQVJTLFxuICAgICAgICB0ZXh0RWRpdG9yID0+IHRoaXMuX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSxcbiAgICAgICAgdGV4dEVkaXRvciA9PiB0aGlzLl9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpKSk7XG4gIH1cblxuICBkaXNhYmxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9lbmFibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLnNldCh0ZXh0RWRpdG9yLCB0ZXh0RWRpdG9yLm9uRGlkSW5zZXJ0VGV4dCgoZXZlbnQpID0+IHtcbiAgICAgIHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAnb2JqYzppbmRlbnQtY29sb24nLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qge3JhbmdlLCB0ZXh0fSA9IGV2ZW50O1xuXG4gICAgICAgICAgLy8gSWdub3JlIHRoZSBpbnNlcnRlZCB0ZXh0IGlmIHRoZSB1c2VyIGlzIHR5cGluZyBpbiBhIHN0cmluZyBvciBjb21tZW50LlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gVGhlIHNjb3BlIGRlc2NyaXB0b3IgbWFya3MgdGhlIHRleHQgd2l0aCBzZW1hbnRpYyBpbmZvcm1hdGlvbixcbiAgICAgICAgICAvLyBnZW5lcmFsbHkgdXNlZCBmb3Igc3ludGF4IGhpZ2hsaWdodGluZy5cbiAgICAgICAgICBjb25zdCBpc05vbkNvZGVUZXh0ID0gdGV4dEVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihyYW5nZS5zdGFydClcbiAgICAgICAgICAgIC5nZXRTY29wZXNBcnJheSgpXG4gICAgICAgICAgICAuc29tZShzY29wZSA9PiBzY29wZS5zdGFydHNXaXRoKCdzdHJpbmcnKSB8fCBzY29wZS5zdGFydHNXaXRoKCdjb21tZW50JykpO1xuICAgICAgICAgIGlmICh0ZXh0ICE9PSAnOicgfHwgaXNOb25Db2RlVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCk7XG5cbiAgICAgICAgICBjb25zdCBjdXJyZW50Q29sb25Qb3NpdGlvbiA9IHJhbmdlLnN0YXJ0O1xuICAgICAgICAgIGNvbnN0IGNvbG9uQ29sdW1uID1cbiAgICAgICAgICBPYmplY3RpdmVDQ29sb25JbmRlbnRlci5nZXRJbmRlbnRlZENvbG9uQ29sdW1uKGJ1ZmZlciwgY3VycmVudENvbG9uUG9zaXRpb24pO1xuICAgICAgICAgIGlmICghY29sb25Db2x1bW4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBGdWxseSByZXBsYWNlIHRoZSBjdXJyZW50IGxpbmUgd2l0aCB0aGUgcHJvcGVybHktaW5kZW50ZWQgbGluZS5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIDEuIEdldCB0aGUgY3VycmVudCBsaW5lIGFuZCBzdHJpcCBhbGwgdGhlIGluZGVudGF0aW9uLlxuICAgICAgICAgIGNvbnN0IGxpbmUgPSBidWZmZXIubGluZUZvclJvdyhjdXJyZW50Q29sb25Qb3NpdGlvbi5yb3cpO1xuICAgICAgICAgIC8vICRGbG93SXNzdWUgVGhpcyBuZWVkcyB0byBiZSBhZGRlZCB0byBsaWIvY29yZS5qcy5cbiAgICAgICAgICBjb25zdCB1bmluZGVudGVkTGluZSA9IGxpbmUudHJpbUxlZnQoKTtcbiAgICAgICAgICAvLyAyLiBDYWxjdWxhdGUgdGhlIGFtb3VudCBvZiBpbmRlbnRhdGlvbiB0aGUgbGluZSBzaG91bGQgZW5kIHVwIHdpdGguXG4gICAgICAgICAgY29uc3QgbnVtYmVyT2ZJbmRlbnRDaGFyYWN0ZXJzID0gbGluZS5sZW5ndGggLSB1bmluZGVudGVkTGluZS5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbiA9IGN1cnJlbnRDb2xvblBvc2l0aW9uLmNvbHVtbiAtIG51bWJlck9mSW5kZW50Q2hhcmFjdGVycztcbiAgICAgICAgICBjb25zdCB0b3RhbEluZGVudEFtb3VudCA9IHVuaW5kZW50ZWRDdXJyZW50Q29sb25Db2x1bW4gPj0gY29sb25Db2x1bW5cbiAgICAgICAgICAgID8gMFxuICAgICAgICAgICAgOiBjb2xvbkNvbHVtbiAtIHVuaW5kZW50ZWRDdXJyZW50Q29sb25Db2x1bW47XG4gICAgICAgICAgLy8gMy4gUmVwbGFjZSB0aGUgY3VycmVudCBsaW5lIHdpdGggdGhlIHByb3Blcmx5LWluZGVudGVkIGxpbmUuXG4gICAgICAgICAgdGV4dEVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShcbiAgICAgICAgICAgIGJ1ZmZlci5yYW5nZUZvclJvdyhjdXJyZW50Q29sb25Qb3NpdGlvbi5yb3csIC8qIGluY2x1ZGVOZXdsaW5lICovIGZhbHNlKSxcbiAgICAgICAgICAgICcgJy5yZXBlYXQodG90YWxJbmRlbnRBbW91bnQpICsgdW5pbmRlbnRlZExpbmUpO1xuXG4gICAgICAgICAgLy8gTW92ZSB0aGUgY3Vyc29yIHRvIHJpZ2h0IGFmdGVyIHRoZSBpbnNlcnRlZCBjb2xvbi5cbiAgICAgICAgICBjb25zdCBuZXdDdXJzb3JQb3NpdGlvbiA9IFtcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvblBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgIHRvdGFsSW5kZW50QW1vdW50ICsgdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbiArIDEsXG4gICAgICAgICAgXTtcbiAgICAgICAgICB0ZXh0RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ld0N1cnNvclBvc2l0aW9uKTtcbiAgICAgICAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24obmV3Q3Vyc29yUG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pKTtcbiAgfVxuXG4gIF9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5nZXQodGV4dEVkaXRvcik7XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBjb2x1bW4gb2YgdGhlIGNvbG9uIHRvIGFsaWduIHdpdGgsIG9yIG51bGwgaWYgaXQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIHN0YXRpYyBnZXRJbmRlbnRlZENvbG9uQ29sdW1uKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyLCBzdGFydFBvc2l0aW9uOiBhdG9tJFBvaW50KTogP251bWJlciB7XG4gICAgY29uc3Qgc3RhcnRQb3NpdGlvblRleHQgPSBidWZmZXIuZ2V0VGV4dEluUmFuZ2UoUmFuZ2UuZnJvbU9iamVjdChcbiAgICAgICAgW3N0YXJ0UG9zaXRpb24sIHN0YXJ0UG9zaXRpb24udHJhbnNsYXRlKFswLCAxXSldKSk7XG4gICAgaWYgKHN0YXJ0UG9zaXRpb25UZXh0ICE9PSAnOicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBzdGFydCBwb3NpdGlvbiBtdXN0IGNvbnRhaW4gYSBjb2xvbiwgZm91bmQgJyR7c3RhcnRQb3NpdGlvblRleHR9JyBpbnN0ZWFkYCk7XG4gICAgfVxuXG4gICAgLy8gTG9vayBmb3IgdGhlIGZpcnN0IGNvbG9uIGFmdGVyIHRoZSBzdGFydCBvZiB0aGUgY3VycmVudCBtZXRob2QuXG4gICAgLy9cbiAgICAvLyBUaGUgZ2VuZXJhbCBhcHByb2FjaCBpcyB0byBpdGVyYXRlIGJhY2t3YXJkcywgY2hlY2tpbmcga2V5IGNoYXJhY3RlcnMuXG4gICAgLy8gV2Uga2VlcCB0cmFjayBvZiB0aGUgbGFzdCBjb2xvbiB0aGF0IHdlIHNlZSAoaS5lLiB0aGUgY29sb24gdGhhdCBpc1xuICAgIC8vIGNsb3Nlc3QgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgZG9jdW1lbnQpIGFuZCB0ZXJtaW5hdGUgb25jZSB3ZSd2ZVxuICAgIC8vIHJlYWNoZWQgdGhlIHN0YXJ0IG9mIHRoZSBtZXRob2QuXG4gICAgLy9cbiAgICAvLyBUaGlzIGRvZXNuJ3Qgd29yayBpZiB0aGVyZSBhcmUgc3RyaW5ncy9jb21tZW50cyB0aGF0IGNvbnRhaW4gYDpgLlxuICAgIGxldCBjb2x1bW4gPSBudWxsO1xuICAgIGxldCBudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMgPSAwO1xuICAgIGJ1ZmZlci5iYWNrd2FyZHNTY2FuSW5SYW5nZShcbiAgICAgICAgLy8gT25seSBzdG9wIGF0IHRoZSBrZXkgY2hhcmFjdGVyczogYDpbXSstYC5cbiAgICAgICAgLzp8XFxbfFxcXXxcXCt8LS9nLFxuICAgICAgICBSYW5nZS5mcm9tT2JqZWN0KFtcbiAgICAgICAgICBzdGFydFBvc2l0aW9uLnRyYW5zbGF0ZShbLU5VTUJFUl9PRl9QUkVWSU9VU19MSU5FU19UT19TRUFSQ0hfRk9SX0NPTE9OUywgMF0pLFxuICAgICAgICAgIHN0YXJ0UG9zaXRpb24udHJhbnNsYXRlKFswLCAtMV0pLFxuICAgICAgICBdKSxcbiAgICAgICAgKHttYXRjaCwgbWF0Y2hUZXh0LCByYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHJhbmdlLnN0YXJ0O1xuICAgICAgICAgIC8vIElmIHdlIGZpbmQgYSBrZXkgY2hhcmFjdGVyIG9uIHRoZSBzdGFydGluZyBsaW5lLCB0aGVuIHRoZSB1c2VyIGlzXG4gICAgICAgICAgLy8gdHlwaW5nIGEgc2luZ2xlLWxpbmUgbWV0aG9kIChpdCBkb2Vzbid0IG5lZWQgdG8gYmUgaW5kZW50ZWQpLlxuICAgICAgICAgIGNvbnN0IGlzU2luZ2xlTGluZU1ldGhvZCA9IChwb3NpdGlvbi5yb3cgPT09IHN0YXJ0UG9zaXRpb24ucm93KTtcbiAgICAgICAgICAvLyBgK2Agb3IgYC1gIG1lYW5zIHdlJ3ZlIHJlYWNoZWQgdGhlIHN0YXJ0IG9mIGEgbWV0aG9kIGRlY2xhcmF0aW9uLlxuICAgICAgICAgIGNvbnN0IGlzRGVjbGFyYXRpb24gPSAobWF0Y2hUZXh0ID09PSAnKycgfHwgbWF0Y2hUZXh0ID09PSAnLScpO1xuICAgICAgICAgIGlmIChpc1NpbmdsZUxpbmVNZXRob2QgfHwgaXNEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVuYmFsYW5jZWQgYnJhY2tldHMgbWVhbiB3ZSd2ZSByZWFjaGVkIHRoZSBzdGFydCBvZiBhIG1ldGhvZCBjYWxsLlxuICAgICAgICAgIGlmIChtYXRjaFRleHQgPT09ICdbJykge1xuICAgICAgICAgICAgbnVtYmVyT2ZVbmNsb3NlZEJyYWNrZXRzLS07XG4gICAgICAgICAgfSBlbHNlIGlmIChtYXRjaFRleHQgPT09ICddJykge1xuICAgICAgICAgICAgbnVtYmVyT2ZVbmNsb3NlZEJyYWNrZXRzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMgPT09IC0xKSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgbGFzdCBjb2xvbiB0aGF0IHdlIHNlZS5cbiAgICAgICAgICBpZiAobWF0Y2hUZXh0ID09PSAnOicpIHtcbiAgICAgICAgICAgICh7Y29sdW1ufSA9IHBvc2l0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBjb2x1bW47XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RpdmVDQ29sb25JbmRlbnRlcjtcbiJdfQ==