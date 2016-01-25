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

var Point = _require.Point;
var Range = _require.Range;

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

      var _require2 = require('../../atom-helpers');

      var observeLanguageTextEditors = _require2.observeLanguageTextEditors;

      this._languageListener = observeLanguageTextEditors(GRAMMARS, function (textEditor) {
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
        (0, _analytics.trackOperationTiming)('objc:balance-bracket', function () {
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
        this._editingSubscriptionsMap['delete'](textEditor);
      }
    }
  }], [{
    key: 'getOpenBracketInsertPosition',
    value: function getOpenBracketInsertPosition(buffer, closeBracketPosition) {
      var closeBracketText = buffer.getTextInRange(Range.fromObject([closeBracketPosition, closeBracketPosition.translate([0, 1])]));
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
        } else if (startingLine[i] === '\"') {
          doubleQuoteCount++;
        } else {
          if (singleQuoteCount % 2 === 0 && doubleQuoteCount % 2 === 0) {
            // We are not inside a char nor string literal. Count the brackets.
            characterCount[startingLine[i]] = characterCount[startingLine[i]] + 1;
          }
        }
      }

      var stringLiteralMatch = /@".*"\s.*]/.exec(startingLine);
      if (stringLiteralMatch) {
        return Point.fromObject([closeBracketPosition.row, stringLiteralMatch.index]);
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
            return Point.fromObject([currentRowPlusOne, targetMatch.index]);
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

          return Point.fromObject([closeBracketPosition.row, column]);
        }
      } else {
        return null;
      }
    }
  }]);

  return ObjectiveCBracketBalancer;
})();

module.exports = ObjectiveCBracketBalancer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt5QkFZbUMsaUJBQWlCOzs7Ozs7Ozs7O2VBRDdCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBR25CLElBQU0sUUFBUSxHQUFHLENBQ2YsYUFBYSxFQUNiLGVBQWUsQ0FDaEIsQ0FBQzs7Ozs7OztJQU1JLHlCQUF5QjtXQUF6Qix5QkFBeUI7MEJBQXpCLHlCQUF5Qjs7O2VBQXpCLHlCQUF5Qjs7V0FJdkIsa0JBQVM7Ozs7QUFFYixVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O3NCQUNMLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7VUFBM0QsMEJBQTBCLGFBQTFCLDBCQUEwQjs7QUFDakMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLDBCQUEwQixDQUMvQyxRQUFRLEVBQ1IsVUFBQSxVQUFVO2VBQUksTUFBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxFQUNsRCxVQUFBLFVBQVU7ZUFBSSxNQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMxRDs7O1dBRU0sbUJBQVM7O0FBRWQsVUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMzQixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQzs7QUFFOUIsVUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxVQUFBLFlBQVk7ZUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQzlFLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FB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Q0FBQztBQUNqRCxjQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWYsY0FBSSxTQUFTLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzdCLGdCQUFJLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsa0JBQU0sR0FBRyxtQkFBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1dBQ3JELE1BQU0sSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7QUFDckQsa0JBQU0sR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7V0FDakMsTUFBTTtBQUNMLGtCQUFNLEdBQUcsQ0FBQyxDQUFDO1dBQ1o7O0FBRUQsaUJBQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzdEO09BQ0YsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1NBcklHLHlCQUF5Qjs7O0FBd0kvQixNQUFNLENBQUMsT0FBTyxHQUFHLHlCQUF5QixDQUFDIiwiZmlsZSI6Ik9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IEdSQU1NQVJTID0gW1xuICAnc291cmNlLm9iamMnLFxuICAnc291cmNlLm9iamNwcCcsXG5dO1xuXG4vKipcbiAqIFRoaXMgY2xvc2VzIHNxdWFyZSBicmFja2V0cyBmb3IgT2JqZWN0aXZlLUMgbWVzc2FnZSBjYWxscy5cbiAqIENsaWVudHMgbXVzdCBjYWxsIGBkaXNhYmxlKClgIG9uY2UgdGhleSdyZSBkb25lIHdpdGggYW4gaW5zdGFuY2UuXG4gKi9cbmNsYXNzIE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIge1xuICBfZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBhdG9tJERpc3Bvc2FibGU+O1xuICBfbGFuZ3VhZ2VMaXN0ZW5lcjogP2F0b20kRGlzcG9zYWJsZTtcblxuICBlbmFibGUoKTogdm9pZCB7XG4gICAgLy8gVGhlIGZlYXR1cmUgaXMgYWxyZWFkeSBlbmFibGVkLlxuICAgIGlmICh0aGlzLl9sYW5ndWFnZUxpc3RlbmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3Qge29ic2VydmVMYW5ndWFnZVRleHRFZGl0b3JzfSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuICAgIHRoaXMuX2xhbmd1YWdlTGlzdGVuZXIgPSBvYnNlcnZlTGFuZ3VhZ2VUZXh0RWRpdG9ycyhcbiAgICAgICAgR1JBTU1BUlMsXG4gICAgICAgIHRleHRFZGl0b3IgPT4gdGhpcy5fZW5hYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpLFxuICAgICAgICB0ZXh0RWRpdG9yID0+IHRoaXMuX2Rpc2FibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcikpO1xuICB9XG5cbiAgZGlzYWJsZSgpOiB2b2lkIHtcbiAgICAvLyBUaGUgZmVhdHVyZSBpcyBhbHJlYWR5IGRpc2FibGVkLlxuICAgIGlmICghdGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9sYW5ndWFnZUxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9sYW5ndWFnZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwLmZvckVhY2goc3Vic2NyaXB0aW9uID0+IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwLmNsZWFyKCk7XG4gIH1cblxuICBfZW5hYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBpbnNlcnRUZXh0U3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vbkRpZEluc2VydFRleHQoKGV2ZW50KSA9PiB7XG4gICAgICB0cmFja09wZXJhdGlvblRpbWluZygnb2JqYzpiYWxhbmNlLWJyYWNrZXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtyYW5nZSwgdGV4dH0gPSBldmVudDtcbiAgICAgICAgaWYgKHRleHQgPT09ICddJykge1xuICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgICAgICAgY29uc3QgbGVmdEJyYWNrZXRJbnNlcnRQb3NpdGlvbiA9IE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXJcbiAgICAgICAgICAgIC5nZXRPcGVuQnJhY2tldEluc2VydFBvc2l0aW9uKGJ1ZmZlciwgcmFuZ2Uuc3RhcnQpO1xuICAgICAgICAgIGlmIChsZWZ0QnJhY2tldEluc2VydFBvc2l0aW9uKSB7XG4gICAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxlZnRCcmFja2V0SW5zZXJ0UG9zaXRpb24sICdbJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5zZXQodGV4dEVkaXRvciwgaW5zZXJ0VGV4dFN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBfZGlzYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXAuZ2V0KHRleHRFZGl0b3IpO1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldE9wZW5CcmFja2V0SW5zZXJ0UG9zaXRpb24oXG4gICAgYnVmZmVyOiBhdG9tJFRleHRCdWZmZXIsXG4gICAgY2xvc2VCcmFja2V0UG9zaXRpb246IFBvaW50LFxuICApOiA/UG9pbnQge1xuICAgIGNvbnN0IGNsb3NlQnJhY2tldFRleHQgPSBidWZmZXIuZ2V0VGV4dEluUmFuZ2UoUmFuZ2UuZnJvbU9iamVjdChcbiAgICAgICAgW2Nsb3NlQnJhY2tldFBvc2l0aW9uLCBjbG9zZUJyYWNrZXRQb3NpdGlvbi50cmFuc2xhdGUoWzAsIDFdKV0pKTtcbiAgICBpZiAoY2xvc2VCcmFja2V0VGV4dCAhPT0gJ10nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjbG9zZSBicmFja2V0IHBvc2l0aW9uIG11c3QgY29udGFpbiBhIGNsb3NlIGJyYWNrZXQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydGluZ0xpbmUgPSBidWZmZXIubGluZUZvclJvdyhjbG9zZUJyYWNrZXRQb3NpdGlvbi5yb3cpO1xuICAgIGxldCBzaW5nbGVRdW90ZUNvdW50ID0gMDtcbiAgICBsZXQgZG91YmxlUXVvdGVDb3VudCA9IDA7XG4gICAgY29uc3QgY2hhcmFjdGVyQ291bnQgPSB7XG4gICAgICAnWyc6IDAsXG4gICAgICAnXSc6IDAsXG4gICAgfTtcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgbGluZSwgZGV0ZXJtaW5pbmcgaWYgd2UgaGF2ZSBiYWxhbmNlZCBicmFja2V0cy5cbiAgICAvLyBXZSBkbyBub3QgY291bnQgYnJhY2tldHMgd2UgZW5jb3VudGVyIGluc2lkZSBzdHJpbmcvY2hhciBsaXRlcmFscy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXJ0aW5nTGluZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0YXJ0aW5nTGluZVtpXSA9PT0gJ1xcJycpIHtcbiAgICAgICAgc2luZ2xlUXVvdGVDb3VudCsrO1xuICAgICAgfSBlbHNlIGlmIChzdGFydGluZ0xpbmVbaV0gPT09ICdcXFwiJykge1xuICAgICAgICBkb3VibGVRdW90ZUNvdW50Kys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2luZ2xlUXVvdGVDb3VudCAlIDIgPT09IDAgJiYgZG91YmxlUXVvdGVDb3VudCAlIDIgPT09IDApIHtcbiAgICAgICAgICAvLyBXZSBhcmUgbm90IGluc2lkZSBhIGNoYXIgbm9yIHN0cmluZyBsaXRlcmFsLiBDb3VudCB0aGUgYnJhY2tldHMuXG4gICAgICAgICAgY2hhcmFjdGVyQ291bnRbc3RhcnRpbmdMaW5lW2ldXSA9IGNoYXJhY3RlckNvdW50W3N0YXJ0aW5nTGluZVtpXV0gKyAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaW5nTGl0ZXJhbE1hdGNoID0gL0BcIi4qXCJcXHMuKl0vLmV4ZWMoc3RhcnRpbmdMaW5lKTtcbiAgICBpZiAoc3RyaW5nTGl0ZXJhbE1hdGNoKSB7XG4gICAgICByZXR1cm4gUG9pbnQuZnJvbU9iamVjdChbY2xvc2VCcmFja2V0UG9zaXRpb24ucm93LCBzdHJpbmdMaXRlcmFsTWF0Y2guaW5kZXhdKTtcbiAgICB9IGVsc2UgaWYgKGNoYXJhY3RlckNvdW50WydbJ10gPCBjaGFyYWN0ZXJDb3VudFsnXSddKSB7XG4gICAgICAvLyBDaGVjayBpZiB3ZSdyZSBhdCB0aGUgYm90dG9tIG9mIGEgbXVsdGktbGluZSBtZXRob2QuXG4gICAgICBjb25zdCBtdWx0aUxpbmVNZXRob2RSZWdleCA9IC9eW1xcc1xcd1xcW10qOi4qW147e107PyQvO1xuICAgICAgbGV0IGN1cnJlbnRSb3cgPSBjbG9zZUJyYWNrZXRQb3NpdGlvbi5yb3c7XG4gICAgICBsZXQgY3VycmVudFJvd1BsdXNPbmUgPSBudWxsO1xuICAgICAgbGV0IG1hdGNoID0gbXVsdGlMaW5lTWV0aG9kUmVnZXguZXhlYyhidWZmZXIubGluZUZvclJvdyhjdXJyZW50Um93KSk7XG5cbiAgICAgIHdoaWxlIChtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICBjdXJyZW50Um93UGx1c09uZSA9IGN1cnJlbnRSb3c7XG4gICAgICAgIG1hdGNoID0gbXVsdGlMaW5lTWV0aG9kUmVnZXguZXhlYyhidWZmZXIubGluZUZvclJvdygtLWN1cnJlbnRSb3cpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRSb3dQbHVzT25lICE9PSBudWxsICYmIGN1cnJlbnRSb3dQbHVzT25lICE9PSBjbG9zZUJyYWNrZXRQb3NpdGlvbi5yb3cpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0TGluZSA9IGJ1ZmZlci5saW5lRm9yUm93KGN1cnJlbnRSb3dQbHVzT25lKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0TWF0Y2ggPSAvXFxTLy5leGVjKHRhcmdldExpbmUpO1xuXG4gICAgICAgIGlmICh0YXJnZXRMaW5lW3RhcmdldE1hdGNoLmluZGV4XSA9PT0gJ1snKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFBvaW50LmZyb21PYmplY3QoW2N1cnJlbnRSb3dQbHVzT25lLCB0YXJnZXRNYXRjaC5pbmRleF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBuZWVkIGEgYnJhY2tldCBvbiB0aGlzIGxpbmUgLSBhdCB0aGlzIHBvaW50IGl0J3MgZWl0aGVyXG4gICAgICAgIC8vIEF0IHRoZSBiZWdpbm5pbmcsIG9yIGFmdGVyIGFuIGA9YC5cbiAgICAgICAgY29uc3QgaW5pdE1hdGNoID0gLy4qKD1cXHM/KVxcUy8uZXhlYyhzdGFydGluZ0xpbmUpO1xuICAgICAgICBjb25zdCBzdGFydE9mTGluZU1hdGNoID0gL1xcUy8uZXhlYyhzdGFydGluZ0xpbmUpO1xuICAgICAgICBsZXQgY29sdW1uID0gMDtcblxuICAgICAgICBpZiAoaW5pdE1hdGNoICYmIGluaXRNYXRjaFsxXSkge1xuICAgICAgICAgIGxldCBlcXVhbHNNYXRjaFBvc2l0aW9uID0gc3RhcnRpbmdMaW5lLmxhc3RJbmRleE9mKGluaXRNYXRjaFsxXSk7XG4gICAgICAgICAgY29sdW1uID0gZXF1YWxzTWF0Y2hQb3NpdGlvbiArPSBpbml0TWF0Y2hbMV0ubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0T2ZMaW5lTWF0Y2ggJiYgc3RhcnRPZkxpbmVNYXRjaC5pbmRleCkge1xuICAgICAgICAgIGNvbHVtbiA9IHN0YXJ0T2ZMaW5lTWF0Y2guaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29sdW1uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQb2ludC5mcm9tT2JqZWN0KFtjbG9zZUJyYWNrZXRQb3NpdGlvbi5yb3csIGNvbHVtbl0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyO1xuIl19