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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt5QkFZbUMsaUJBQWlCOzs7Ozs7Ozs7O2VBRDdCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBR25CLElBQU0sUUFBUSxHQUFHLENBQ2YsYUFBYSxFQUNiLGVBQWUsQ0FDaEIsQ0FBQzs7Ozs7OztJQU1JLHlCQUF5QjtXQUF6Qix5QkFBeUI7MEJBQXpCLHlCQUF5Qjs7O2VBQXpCLHlCQUF5Qjs7V0FJdkIsa0JBQVM7Ozs7QUFFYixVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O3NCQUNMLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7VUFBM0QsMEJBQTBCLGFBQTFCLDBCQUEwQjs7QUFDakMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLDBCQUEwQixDQUMvQyxRQUFRLEVBQ1IsVUFBQSxVQUFVO2VBQUksTUFBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxFQUNsRCxVQUFBLFVBQVU7ZUFBSSxNQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMxRDs7O1dBRU0sbUJBQVM7O0FBRWQsVUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMzQixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQzs7QUFFOUIsVUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxVQUFBLFlBQVk7ZUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQzlFLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FB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Q0FBQztBQUNqRCxjQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWYsY0FBSSxTQUFTLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzdCLGdCQUFJLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsa0JBQU0sR0FBRyxtQkFBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1dBQ3JELE1BQU0sSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7QUFDckQsa0JBQU0sR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7V0FDakMsTUFBTTtBQUNMLGtCQUFNLEdBQUcsQ0FBQyxDQUFDO1dBQ1o7O0FBRUQsaUJBQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzdEO09BQ0YsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1NBcklHLHlCQUF5Qjs7O0FBd0kvQixNQUFNLENBQUMsT0FBTyxHQUFHLHlCQUF5QixDQUFDIiwiZmlsZSI6Ik9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IEdSQU1NQVJTID0gW1xuICAnc291cmNlLm9iamMnLFxuICAnc291cmNlLm9iamNwcCcsXG5dO1xuXG4vKipcbiAqIFRoaXMgY2xvc2VzIHNxdWFyZSBicmFja2V0cyBmb3IgT2JqZWN0aXZlLUMgbWVzc2FnZSBjYWxscy5cbiAqIENsaWVudHMgbXVzdCBjYWxsIGBkaXNhYmxlKClgIG9uY2UgdGhleSdyZSBkb25lIHdpdGggYW4gaW5zdGFuY2UuXG4gKi9cbmNsYXNzIE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIge1xuICBfZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBJRGlzcG9zYWJsZT47XG4gIF9sYW5ndWFnZUxpc3RlbmVyOiA/SURpc3Bvc2FibGU7XG5cbiAgZW5hYmxlKCk6IHZvaWQge1xuICAgIC8vIFRoZSBmZWF0dXJlIGlzIGFscmVhZHkgZW5hYmxlZC5cbiAgICBpZiAodGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHtvYnNlcnZlTGFuZ3VhZ2VUZXh0RWRpdG9yc30gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbiAgICB0aGlzLl9sYW5ndWFnZUxpc3RlbmVyID0gb2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnMoXG4gICAgICAgIEdSQU1NQVJTLFxuICAgICAgICB0ZXh0RWRpdG9yID0+IHRoaXMuX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSxcbiAgICAgICAgdGV4dEVkaXRvciA9PiB0aGlzLl9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpKTtcbiAgfVxuXG4gIGRpc2FibGUoKTogdm9pZCB7XG4gICAgLy8gVGhlIGZlYXR1cmUgaXMgYWxyZWFkeSBkaXNhYmxlZC5cbiAgICBpZiAoIXRoaXMuX2xhbmd1YWdlTGlzdGVuZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5jbGVhcigpO1xuICB9XG5cbiAgX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgaW5zZXJ0VGV4dFN1YnNjcmlwdGlvbiA9IHRleHRFZGl0b3Iub25EaWRJbnNlcnRUZXh0KChldmVudCkgPT4ge1xuICAgICAgdHJhY2tPcGVyYXRpb25UaW1pbmcoJ29iamM6YmFsYW5jZS1icmFja2V0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCB7cmFuZ2UsIHRleHR9ID0gZXZlbnQ7XG4gICAgICAgIGlmICh0ZXh0ID09PSAnXScpIHtcbiAgICAgICAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgICAgIGNvbnN0IGxlZnRCcmFja2V0SW5zZXJ0UG9zaXRpb24gPSBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyXG4gICAgICAgICAgICAuZ2V0T3BlbkJyYWNrZXRJbnNlcnRQb3NpdGlvbihidWZmZXIsIHJhbmdlLnN0YXJ0KTtcbiAgICAgICAgICBpZiAobGVmdEJyYWNrZXRJbnNlcnRQb3NpdGlvbikge1xuICAgICAgICAgICAgYnVmZmVyLmluc2VydChsZWZ0QnJhY2tldEluc2VydFBvc2l0aW9uLCAnWycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXAuc2V0KHRleHRFZGl0b3IsIGluc2VydFRleHRTdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgX2Rpc2FibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwLmdldCh0ZXh0RWRpdG9yKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRPcGVuQnJhY2tldEluc2VydFBvc2l0aW9uKFxuICAgIGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyLFxuICAgIGNsb3NlQnJhY2tldFBvc2l0aW9uOiBQb2ludCxcbiAgKTogP1BvaW50IHtcbiAgICBjb25zdCBjbG9zZUJyYWNrZXRUZXh0ID0gYnVmZmVyLmdldFRleHRJblJhbmdlKFJhbmdlLmZyb21PYmplY3QoXG4gICAgICAgIFtjbG9zZUJyYWNrZXRQb3NpdGlvbiwgY2xvc2VCcmFja2V0UG9zaXRpb24udHJhbnNsYXRlKFswLCAxXSldKSk7XG4gICAgaWYgKGNsb3NlQnJhY2tldFRleHQgIT09ICddJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY2xvc2UgYnJhY2tldCBwb3NpdGlvbiBtdXN0IGNvbnRhaW4gYSBjbG9zZSBicmFja2V0Jyk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRpbmdMaW5lID0gYnVmZmVyLmxpbmVGb3JSb3coY2xvc2VCcmFja2V0UG9zaXRpb24ucm93KTtcbiAgICBsZXQgc2luZ2xlUXVvdGVDb3VudCA9IDA7XG4gICAgbGV0IGRvdWJsZVF1b3RlQ291bnQgPSAwO1xuICAgIGNvbnN0IGNoYXJhY3RlckNvdW50ID0ge1xuICAgICAgJ1snOiAwLFxuICAgICAgJ10nOiAwLFxuICAgIH07XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGxpbmUsIGRldGVybWluaW5nIGlmIHdlIGhhdmUgYmFsYW5jZWQgYnJhY2tldHMuXG4gICAgLy8gV2UgZG8gbm90IGNvdW50IGJyYWNrZXRzIHdlIGVuY291bnRlciBpbnNpZGUgc3RyaW5nL2NoYXIgbGl0ZXJhbHMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydGluZ0xpbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChzdGFydGluZ0xpbmVbaV0gPT09ICdcXCcnKSB7XG4gICAgICAgIHNpbmdsZVF1b3RlQ291bnQrKztcbiAgICAgIH0gZWxzZSBpZiAoc3RhcnRpbmdMaW5lW2ldID09PSAnXFxcIicpIHtcbiAgICAgICAgZG91YmxlUXVvdGVDb3VudCsrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNpbmdsZVF1b3RlQ291bnQgJSAyID09PSAwICYmIGRvdWJsZVF1b3RlQ291bnQgJSAyID09PSAwKSB7XG4gICAgICAgICAgLy8gV2UgYXJlIG5vdCBpbnNpZGUgYSBjaGFyIG5vciBzdHJpbmcgbGl0ZXJhbC4gQ291bnQgdGhlIGJyYWNrZXRzLlxuICAgICAgICAgIGNoYXJhY3RlckNvdW50W3N0YXJ0aW5nTGluZVtpXV0gPSBjaGFyYWN0ZXJDb3VudFtzdGFydGluZ0xpbmVbaV1dICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN0cmluZ0xpdGVyYWxNYXRjaCA9IC9AXCIuKlwiXFxzLipdLy5leGVjKHN0YXJ0aW5nTGluZSk7XG4gICAgaWYgKHN0cmluZ0xpdGVyYWxNYXRjaCkge1xuICAgICAgcmV0dXJuIFBvaW50LmZyb21PYmplY3QoW2Nsb3NlQnJhY2tldFBvc2l0aW9uLnJvdywgc3RyaW5nTGl0ZXJhbE1hdGNoLmluZGV4XSk7XG4gICAgfSBlbHNlIGlmIChjaGFyYWN0ZXJDb3VudFsnWyddIDwgY2hhcmFjdGVyQ291bnRbJ10nXSkge1xuICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgYXQgdGhlIGJvdHRvbSBvZiBhIG11bHRpLWxpbmUgbWV0aG9kLlxuICAgICAgY29uc3QgbXVsdGlMaW5lTWV0aG9kUmVnZXggPSAvXltcXHNcXHdcXFtdKjouKlteO3tdOz8kLztcbiAgICAgIGxldCBjdXJyZW50Um93ID0gY2xvc2VCcmFja2V0UG9zaXRpb24ucm93O1xuICAgICAgbGV0IGN1cnJlbnRSb3dQbHVzT25lID0gbnVsbDtcbiAgICAgIGxldCBtYXRjaCA9IG11bHRpTGluZU1ldGhvZFJlZ2V4LmV4ZWMoYnVmZmVyLmxpbmVGb3JSb3coY3VycmVudFJvdykpO1xuXG4gICAgICB3aGlsZSAobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgY3VycmVudFJvd1BsdXNPbmUgPSBjdXJyZW50Um93O1xuICAgICAgICBtYXRjaCA9IG11bHRpTGluZU1ldGhvZFJlZ2V4LmV4ZWMoYnVmZmVyLmxpbmVGb3JSb3coLS1jdXJyZW50Um93KSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50Um93UGx1c09uZSAhPT0gbnVsbCAmJiBjdXJyZW50Um93UGx1c09uZSAhPT0gY2xvc2VCcmFja2V0UG9zaXRpb24ucm93KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldExpbmUgPSBidWZmZXIubGluZUZvclJvdyhjdXJyZW50Um93UGx1c09uZSk7XG4gICAgICAgIGNvbnN0IHRhcmdldE1hdGNoID0gL1xcUy8uZXhlYyh0YXJnZXRMaW5lKTtcblxuICAgICAgICBpZiAodGFyZ2V0TGluZVt0YXJnZXRNYXRjaC5pbmRleF0gPT09ICdbJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQb2ludC5mcm9tT2JqZWN0KFtjdXJyZW50Um93UGx1c09uZSwgdGFyZ2V0TWF0Y2guaW5kZXhdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UgbmVlZCBhIGJyYWNrZXQgb24gdGhpcyBsaW5lIC0gYXQgdGhpcyBwb2ludCBpdCdzIGVpdGhlclxuICAgICAgICAvLyBBdCB0aGUgYmVnaW5uaW5nLCBvciBhZnRlciBhbiBgPWAuXG4gICAgICAgIGNvbnN0IGluaXRNYXRjaCA9IC8uKig9XFxzPylcXFMvLmV4ZWMoc3RhcnRpbmdMaW5lKTtcbiAgICAgICAgY29uc3Qgc3RhcnRPZkxpbmVNYXRjaCA9IC9cXFMvLmV4ZWMoc3RhcnRpbmdMaW5lKTtcbiAgICAgICAgbGV0IGNvbHVtbiA9IDA7XG5cbiAgICAgICAgaWYgKGluaXRNYXRjaCAmJiBpbml0TWF0Y2hbMV0pIHtcbiAgICAgICAgICBsZXQgZXF1YWxzTWF0Y2hQb3NpdGlvbiA9IHN0YXJ0aW5nTGluZS5sYXN0SW5kZXhPZihpbml0TWF0Y2hbMV0pO1xuICAgICAgICAgIGNvbHVtbiA9IGVxdWFsc01hdGNoUG9zaXRpb24gKz0gaW5pdE1hdGNoWzFdLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydE9mTGluZU1hdGNoICYmIHN0YXJ0T2ZMaW5lTWF0Y2guaW5kZXgpIHtcbiAgICAgICAgICBjb2x1bW4gPSBzdGFydE9mTGluZU1hdGNoLmluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbHVtbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUG9pbnQuZnJvbU9iamVjdChbY2xvc2VCcmFja2V0UG9zaXRpb24ucm93LCBjb2x1bW5dKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlcjtcbiJdfQ==