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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt5QkFZbUMsaUJBQWlCOzs7Ozs7Ozs7O2VBRDdCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBR25CLElBQU0sUUFBUSxHQUFHLENBQ2YsYUFBYSxFQUNiLGVBQWUsQ0FDaEIsQ0FBQzs7Ozs7OztJQU1JLHlCQUF5QjtXQUF6Qix5QkFBeUI7MEJBQXpCLHlCQUF5Qjs7O2VBQXpCLHlCQUF5Qjs7V0FJdkIsa0JBQVM7Ozs7QUFFYixVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O3NCQUNMLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7VUFBM0QsMEJBQTBCLGFBQTFCLDBCQUEwQjs7QUFDakMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLDBCQUEwQixDQUMvQyxRQUFRLEVBQ1IsVUFBQSxVQUFVO2VBQUksTUFBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxFQUNsRCxVQUFBLFVBQVU7ZUFBSSxNQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMxRDs7O1dBRU0sbUJBQVM7O0FBRWQsVUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMzQixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQzs7QUFFOUIsVUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxVQUFBLFlBQVk7ZUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQzlFLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FB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Q0FBQztBQUNqRCxjQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWYsY0FBSSxTQUFTLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzdCLGdCQUFJLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsa0JBQU0sR0FBRyxtQkFBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1dBQ3JELE1BQU0sSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7QUFDckQsa0JBQU0sR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7V0FDakMsTUFBTTtBQUNMLGtCQUFNLEdBQUcsQ0FBQyxDQUFDO1dBQ1o7O0FBRUQsaUJBQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzdEO09BQ0YsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1NBcklHLHlCQUF5Qjs7O0FBd0kvQixNQUFNLENBQUMsT0FBTyxHQUFHLHlCQUF5QixDQUFDIiwiZmlsZSI6Ik9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IEdSQU1NQVJTID0gW1xuICAnc291cmNlLm9iamMnLFxuICAnc291cmNlLm9iamNwcCcsXG5dO1xuXG4vKipcbiAqIFRoaXMgY2xvc2VzIHNxdWFyZSBicmFja2V0cyBmb3IgT2JqZWN0aXZlLUMgbWVzc2FnZSBjYWxscy5cbiAqIENsaWVudHMgbXVzdCBjYWxsIGBkaXNhYmxlKClgIG9uY2UgdGhleSdyZSBkb25lIHdpdGggYW4gaW5zdGFuY2UuXG4gKi9cbmNsYXNzIE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXIge1xuICBfZWRpdGluZ1N1YnNjcmlwdGlvbnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBJRGlzcG9zYWJsZT47XG4gIF9sYW5ndWFnZUxpc3RlbmVyOiA/SURpc3Bvc2FibGU7XG5cbiAgZW5hYmxlKCk6IHZvaWQge1xuICAgIC8vIFRoZSBmZWF0dXJlIGlzIGFscmVhZHkgZW5hYmxlZC5cbiAgICBpZiAodGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHtvYnNlcnZlTGFuZ3VhZ2VUZXh0RWRpdG9yc30gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbiAgICB0aGlzLl9sYW5ndWFnZUxpc3RlbmVyID0gb2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnMoXG4gICAgICAgIEdSQU1NQVJTLFxuICAgICAgICB0ZXh0RWRpdG9yID0+IHRoaXMuX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSxcbiAgICAgICAgdGV4dEVkaXRvciA9PiB0aGlzLl9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpKTtcbiAgfVxuXG4gIGRpc2FibGUoKTogdm9pZCB7XG4gICAgLy8gVGhlIGZlYXR1cmUgaXMgYWxyZWFkeSBkaXNhYmxlZC5cbiAgICBpZiAoIXRoaXMuX2xhbmd1YWdlTGlzdGVuZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fbGFuZ3VhZ2VMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5jbGVhcigpO1xuICB9XG5cbiAgX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgaW5zZXJ0VGV4dFN1YnNjcmlwdGlvbiA9IHRleHRFZGl0b3Iub25EaWRJbnNlcnRUZXh0KGV2ZW50ID0+IHtcbiAgICAgIHRyYWNrT3BlcmF0aW9uVGltaW5nKCdvYmpjOmJhbGFuY2UtYnJhY2tldCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qge3JhbmdlLCB0ZXh0fSA9IGV2ZW50O1xuICAgICAgICBpZiAodGV4dCA9PT0gJ10nKSB7XG4gICAgICAgICAgY29uc3QgYnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICAgICAgICBjb25zdCBsZWZ0QnJhY2tldEluc2VydFBvc2l0aW9uID0gT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlclxuICAgICAgICAgICAgLmdldE9wZW5CcmFja2V0SW5zZXJ0UG9zaXRpb24oYnVmZmVyLCByYW5nZS5zdGFydCk7XG4gICAgICAgICAgaWYgKGxlZnRCcmFja2V0SW5zZXJ0UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGJ1ZmZlci5pbnNlcnQobGVmdEJyYWNrZXRJbnNlcnRQb3NpdGlvbiwgJ1snKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwLnNldCh0ZXh0RWRpdG9yLCBpbnNlcnRUZXh0U3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIF9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9lZGl0aW5nU3Vic2NyaXB0aW9uc01hcC5nZXQodGV4dEVkaXRvcik7XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2VkaXRpbmdTdWJzY3JpcHRpb25zTWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0T3BlbkJyYWNrZXRJbnNlcnRQb3NpdGlvbihcbiAgICBidWZmZXI6IGF0b20kVGV4dEJ1ZmZlcixcbiAgICBjbG9zZUJyYWNrZXRQb3NpdGlvbjogUG9pbnQsXG4gICk6ID9Qb2ludCB7XG4gICAgY29uc3QgY2xvc2VCcmFja2V0VGV4dCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShSYW5nZS5mcm9tT2JqZWN0KFxuICAgICAgICBbY2xvc2VCcmFja2V0UG9zaXRpb24sIGNsb3NlQnJhY2tldFBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgMV0pXSkpO1xuICAgIGlmIChjbG9zZUJyYWNrZXRUZXh0ICE9PSAnXScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGNsb3NlIGJyYWNrZXQgcG9zaXRpb24gbXVzdCBjb250YWluIGEgY2xvc2UgYnJhY2tldCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0aW5nTGluZSA9IGJ1ZmZlci5saW5lRm9yUm93KGNsb3NlQnJhY2tldFBvc2l0aW9uLnJvdyk7XG4gICAgbGV0IHNpbmdsZVF1b3RlQ291bnQgPSAwO1xuICAgIGxldCBkb3VibGVRdW90ZUNvdW50ID0gMDtcbiAgICBjb25zdCBjaGFyYWN0ZXJDb3VudCA9IHtcbiAgICAgICdbJzogMCxcbiAgICAgICddJzogMCxcbiAgICB9O1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBsaW5lLCBkZXRlcm1pbmluZyBpZiB3ZSBoYXZlIGJhbGFuY2VkIGJyYWNrZXRzLlxuICAgIC8vIFdlIGRvIG5vdCBjb3VudCBicmFja2V0cyB3ZSBlbmNvdW50ZXIgaW5zaWRlIHN0cmluZy9jaGFyIGxpdGVyYWxzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhcnRpbmdMaW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc3RhcnRpbmdMaW5lW2ldID09PSAnXFwnJykge1xuICAgICAgICBzaW5nbGVRdW90ZUNvdW50Kys7XG4gICAgICB9IGVsc2UgaWYgKHN0YXJ0aW5nTGluZVtpXSA9PT0gJ1xcXCInKSB7XG4gICAgICAgIGRvdWJsZVF1b3RlQ291bnQrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzaW5nbGVRdW90ZUNvdW50ICUgMiA9PT0gMCAmJiBkb3VibGVRdW90ZUNvdW50ICUgMiA9PT0gMCkge1xuICAgICAgICAgIC8vIFdlIGFyZSBub3QgaW5zaWRlIGEgY2hhciBub3Igc3RyaW5nIGxpdGVyYWwuIENvdW50IHRoZSBicmFja2V0cy5cbiAgICAgICAgICBjaGFyYWN0ZXJDb3VudFtzdGFydGluZ0xpbmVbaV1dID0gY2hhcmFjdGVyQ291bnRbc3RhcnRpbmdMaW5lW2ldXSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzdHJpbmdMaXRlcmFsTWF0Y2ggPSAvQFwiLipcIlxccy4qXS8uZXhlYyhzdGFydGluZ0xpbmUpO1xuICAgIGlmIChzdHJpbmdMaXRlcmFsTWF0Y2gpIHtcbiAgICAgIHJldHVybiBQb2ludC5mcm9tT2JqZWN0KFtjbG9zZUJyYWNrZXRQb3NpdGlvbi5yb3csIHN0cmluZ0xpdGVyYWxNYXRjaC5pbmRleF0pO1xuICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyQ291bnRbJ1snXSA8IGNoYXJhY3RlckNvdW50WyddJ10pIHtcbiAgICAgIC8vIENoZWNrIGlmIHdlJ3JlIGF0IHRoZSBib3R0b20gb2YgYSBtdWx0aS1saW5lIG1ldGhvZC5cbiAgICAgIGNvbnN0IG11bHRpTGluZU1ldGhvZFJlZ2V4ID0gL15bXFxzXFx3XFxbXSo6LipbXjt7XTs/JC87XG4gICAgICBsZXQgY3VycmVudFJvdyA9IGNsb3NlQnJhY2tldFBvc2l0aW9uLnJvdztcbiAgICAgIGxldCBjdXJyZW50Um93UGx1c09uZSA9IG51bGw7XG4gICAgICBsZXQgbWF0Y2ggPSBtdWx0aUxpbmVNZXRob2RSZWdleC5leGVjKGJ1ZmZlci5saW5lRm9yUm93KGN1cnJlbnRSb3cpKTtcblxuICAgICAgd2hpbGUgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgICAgIGN1cnJlbnRSb3dQbHVzT25lID0gY3VycmVudFJvdztcbiAgICAgICAgbWF0Y2ggPSBtdWx0aUxpbmVNZXRob2RSZWdleC5leGVjKGJ1ZmZlci5saW5lRm9yUm93KC0tY3VycmVudFJvdykpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudFJvd1BsdXNPbmUgIT09IG51bGwgJiYgY3VycmVudFJvd1BsdXNPbmUgIT09IGNsb3NlQnJhY2tldFBvc2l0aW9uLnJvdykge1xuICAgICAgICBjb25zdCB0YXJnZXRMaW5lID0gYnVmZmVyLmxpbmVGb3JSb3coY3VycmVudFJvd1BsdXNPbmUpO1xuICAgICAgICBjb25zdCB0YXJnZXRNYXRjaCA9IC9cXFMvLmV4ZWModGFyZ2V0TGluZSk7XG5cbiAgICAgICAgaWYgKHRhcmdldExpbmVbdGFyZ2V0TWF0Y2guaW5kZXhdID09PSAnWycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUG9pbnQuZnJvbU9iamVjdChbY3VycmVudFJvd1BsdXNPbmUsIHRhcmdldE1hdGNoLmluZGV4XSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIG5lZWQgYSBicmFja2V0IG9uIHRoaXMgbGluZSAtIGF0IHRoaXMgcG9pbnQgaXQncyBlaXRoZXJcbiAgICAgICAgLy8gQXQgdGhlIGJlZ2lubmluZywgb3IgYWZ0ZXIgYW4gYD1gLlxuICAgICAgICBjb25zdCBpbml0TWF0Y2ggPSAvLiooPVxccz8pXFxTLy5leGVjKHN0YXJ0aW5nTGluZSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0T2ZMaW5lTWF0Y2ggPSAvXFxTLy5leGVjKHN0YXJ0aW5nTGluZSk7XG4gICAgICAgIGxldCBjb2x1bW4gPSAwO1xuXG4gICAgICAgIGlmIChpbml0TWF0Y2ggJiYgaW5pdE1hdGNoWzFdKSB7XG4gICAgICAgICAgbGV0IGVxdWFsc01hdGNoUG9zaXRpb24gPSBzdGFydGluZ0xpbmUubGFzdEluZGV4T2YoaW5pdE1hdGNoWzFdKTtcbiAgICAgICAgICBjb2x1bW4gPSBlcXVhbHNNYXRjaFBvc2l0aW9uICs9IGluaXRNYXRjaFsxXS5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnRPZkxpbmVNYXRjaCAmJiBzdGFydE9mTGluZU1hdGNoLmluZGV4KSB7XG4gICAgICAgICAgY29sdW1uID0gc3RhcnRPZkxpbmVNYXRjaC5pbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb2x1bW4gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFBvaW50LmZyb21PYmplY3QoW2Nsb3NlQnJhY2tldFBvc2l0aW9uLnJvdywgY29sdW1uXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXI7XG4iXX0=