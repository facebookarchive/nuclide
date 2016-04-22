var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAnalytics = require('../../nuclide-analytics');

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

      var _require2 = require('../../nuclide-atom-helpers');

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
        (0, _nuclideAnalytics.trackOperationTiming)('objc:indent-colon', function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Z0NBWW1DLHlCQUF5Qjs7Ozs7Ozs7OztlQUR2QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QyxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBR2pDLElBQU0sUUFBUSxHQUFHLENBQ2YsYUFBYSxFQUNiLGVBQWUsQ0FDaEIsQ0FBQzs7OztBQUlGLElBQU0sNkNBQTZDLEdBQUcsRUFBRSxDQUFDOzs7Ozs7O0lBTW5ELHVCQUF1QjtXQUF2Qix1QkFBdUI7MEJBQXZCLHVCQUF1Qjs7O2VBQXZCLHVCQUF1Qjs7V0FJckIsa0JBQVM7OztBQUNiLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFN0MsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDdEUsbUJBQWEsQ0FBQyxHQUFHLENBQUMsRUFBQyxPQUFPLEVBQUUsbUJBQU07QUFDaEMsZ0JBQUssMkJBQTJCLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWTttQkFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO1dBQUEsQ0FBQyxDQUFDO0FBQ2pGLGdCQUFLLDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDO1NBQzFDLEVBQUMsQ0FBQyxDQUFDOztzQkFFaUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDOztVQUFuRSwwQkFBMEIsYUFBMUIsMEJBQTBCOztBQUNqQyxtQkFBYSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FDeEMsUUFBUSxFQUNSLFVBQUEsVUFBVTtlQUFJLE1BQUssbUJBQW1CLENBQUMsVUFBVSxDQUFDO09BQUEsRUFDbEQsVUFBQSxVQUFVO2VBQUksTUFBSyxvQkFBb0IsQ0FBQyxVQUFVLENBQUM7T0FBQSxD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QzVCLE1BQU0sSUFBSSxTQUFTLEtBQUssR0FBRyxFQUFFO0FBQzVCLGtDQUF3QixFQUFFLENBQUM7U0FDNUI7QUFDRCxZQUFJLHdCQUF3QixLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ25DLGNBQUksRUFBRSxDQUFDO0FBQ1AsaUJBQU87U0FDUjs7O0FBR0QsWUFBSSxTQUFTLEtBQUssR0FBRyxFQUFFO0FBQ25CLGdCQUFNLEdBQUksUUFBUSxDQUFsQixNQUFNO1NBQ1Q7T0FDRixDQUFDLENBQUM7QUFDUCxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7U0F4SkcsdUJBQXVCOzs7QUEySjdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUMiLCJmaWxlIjoiT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHt0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5jb25zdCBHUkFNTUFSUyA9IFtcbiAgJ3NvdXJjZS5vYmpjJyxcbiAgJ3NvdXJjZS5vYmpjcHAnLFxuXTtcblxuLy8gVGhlIGluZGVudGF0aW9uIGFtb3VudCBkZXBlbmRzIG9uIHByZXZpb3VzIGxpbmVzLiBJZiB0aGUgdXNlciB0eXBlcyBhIGNvbG9uIG91dHNpZGUgb2YgYSBtZXRob2Rcbi8vIGNhbGwsIGl0IHNlYXJjaGVzIHRoZSBlbnRpcmUgYnVmZmVyLiBUaGlzIGhhcmQgY3V0b2ZmIHNob3VsZCB3b3JrIGZvciBzYW5lIGNvZGUuXG5jb25zdCBOVU1CRVJfT0ZfUFJFVklPVVNfTElORVNfVE9fU0VBUkNIX0ZPUl9DT0xPTlMgPSAyNTtcblxuLyoqXG4gKiBUaGlzIHByb3ZpZGVzIGltcHJvdmVkIE9iamVjdGl2ZS1DIGluZGVudGF0aW9uIGJ5IGFsaWduaW5nIGNvbG9ucy5cbiAqIENsaWVudHMgbXVzdCBjYWxsIGBkaXNhYmxlKClgIG9uY2UgdGhleSdyZSBkb25lIHdpdGggYW4gaW5zdGFuY2UuXG4gKi9cbmNsYXNzIE9iamVjdGl2ZUNDb2xvbkluZGVudGVyIHtcbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBJRGlzcG9zYWJsZT47XG5cbiAgZW5hYmxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKHtkaXNwb3NlOiAoKSA9PiB7XG4gICAgICB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmNsZWFyKCk7XG4gICAgfX0pO1xuXG4gICAgY29uc3Qge29ic2VydmVMYW5ndWFnZVRleHRFZGl0b3JzfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJyk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQob2JzZXJ2ZUxhbmd1YWdlVGV4dEVkaXRvcnMoXG4gICAgICAgIEdSQU1NQVJTLFxuICAgICAgICB0ZXh0RWRpdG9yID0+IHRoaXMuX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSxcbiAgICAgICAgdGV4dEVkaXRvciA9PiB0aGlzLl9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpKSk7XG4gIH1cblxuICBkaXNhYmxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9lbmFibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLnNldCh0ZXh0RWRpdG9yLCB0ZXh0RWRpdG9yLm9uRGlkSW5zZXJ0VGV4dChldmVudCA9PiB7XG4gICAgICB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgJ29iamM6aW5kZW50LWNvbG9uJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHtyYW5nZSwgdGV4dH0gPSBldmVudDtcblxuICAgICAgICAgIC8vIElnbm9yZSB0aGUgaW5zZXJ0ZWQgdGV4dCBpZiB0aGUgdXNlciBpcyB0eXBpbmcgaW4gYSBzdHJpbmcgb3IgY29tbWVudC5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIFRoZSBzY29wZSBkZXNjcmlwdG9yIG1hcmtzIHRoZSB0ZXh0IHdpdGggc2VtYW50aWMgaW5mb3JtYXRpb24sXG4gICAgICAgICAgLy8gZ2VuZXJhbGx5IHVzZWQgZm9yIHN5bnRheCBoaWdobGlnaHRpbmcuXG4gICAgICAgICAgY29uc3QgaXNOb25Db2RlVGV4dCA9IHRleHRFZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgICAuZ2V0U2NvcGVzQXJyYXkoKVxuICAgICAgICAgICAgLnNvbWUoc2NvcGUgPT4gc2NvcGUuc3RhcnRzV2l0aCgnc3RyaW5nJykgfHwgc2NvcGUuc3RhcnRzV2l0aCgnY29tbWVudCcpKTtcbiAgICAgICAgICBpZiAodGV4dCAhPT0gJzonIHx8IGlzTm9uQ29kZVRleHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuXG4gICAgICAgICAgY29uc3QgY3VycmVudENvbG9uUG9zaXRpb24gPSByYW5nZS5zdGFydDtcbiAgICAgICAgICBjb25zdCBjb2xvbkNvbHVtbiA9XG4gICAgICAgICAgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIuZ2V0SW5kZW50ZWRDb2xvbkNvbHVtbihidWZmZXIsIGN1cnJlbnRDb2xvblBvc2l0aW9uKTtcbiAgICAgICAgICBpZiAoIWNvbG9uQ29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRnVsbHkgcmVwbGFjZSB0aGUgY3VycmVudCBsaW5lIHdpdGggdGhlIHByb3Blcmx5LWluZGVudGVkIGxpbmUuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyAxLiBHZXQgdGhlIGN1cnJlbnQgbGluZSBhbmQgc3RyaXAgYWxsIHRoZSBpbmRlbnRhdGlvbi5cbiAgICAgICAgICBjb25zdCBsaW5lID0gYnVmZmVyLmxpbmVGb3JSb3coY3VycmVudENvbG9uUG9zaXRpb24ucm93KTtcbiAgICAgICAgICAvLyAkRmxvd0lzc3VlIFRoaXMgbmVlZHMgdG8gYmUgYWRkZWQgdG8gbGliL2NvcmUuanMuXG4gICAgICAgICAgY29uc3QgdW5pbmRlbnRlZExpbmUgPSBsaW5lLnRyaW1MZWZ0KCk7XG4gICAgICAgICAgLy8gMi4gQ2FsY3VsYXRlIHRoZSBhbW91bnQgb2YgaW5kZW50YXRpb24gdGhlIGxpbmUgc2hvdWxkIGVuZCB1cCB3aXRoLlxuICAgICAgICAgIGNvbnN0IG51bWJlck9mSW5kZW50Q2hhcmFjdGVycyA9IGxpbmUubGVuZ3RoIC0gdW5pbmRlbnRlZExpbmUubGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IHVuaW5kZW50ZWRDdXJyZW50Q29sb25Db2x1bW4gPVxuICAgICAgICAgICAgY3VycmVudENvbG9uUG9zaXRpb24uY29sdW1uIC0gbnVtYmVyT2ZJbmRlbnRDaGFyYWN0ZXJzO1xuICAgICAgICAgIGNvbnN0IHRvdGFsSW5kZW50QW1vdW50ID0gdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbiA+PSBjb2xvbkNvbHVtblxuICAgICAgICAgICAgPyAwXG4gICAgICAgICAgICA6IGNvbG9uQ29sdW1uIC0gdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbjtcbiAgICAgICAgICAvLyAzLiBSZXBsYWNlIHRoZSBjdXJyZW50IGxpbmUgd2l0aCB0aGUgcHJvcGVybHktaW5kZW50ZWQgbGluZS5cbiAgICAgICAgICB0ZXh0RWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFxuICAgICAgICAgICAgYnVmZmVyLnJhbmdlRm9yUm93KGN1cnJlbnRDb2xvblBvc2l0aW9uLnJvdywgLyogaW5jbHVkZU5ld2xpbmUgKi8gZmFsc2UpLFxuICAgICAgICAgICAgJyAnLnJlcGVhdCh0b3RhbEluZGVudEFtb3VudCkgKyB1bmluZGVudGVkTGluZSk7XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBjdXJzb3IgdG8gcmlnaHQgYWZ0ZXIgdGhlIGluc2VydGVkIGNvbG9uLlxuICAgICAgICAgIGNvbnN0IG5ld0N1cnNvclBvc2l0aW9uID0gW1xuICAgICAgICAgICAgY3VycmVudENvbG9uUG9zaXRpb24ucm93LFxuICAgICAgICAgICAgdG90YWxJbmRlbnRBbW91bnQgKyB1bmluZGVudGVkQ3VycmVudENvbG9uQ29sdW1uICsgMSxcbiAgICAgICAgICBdO1xuICAgICAgICAgIHRleHRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3Q3Vyc29yUG9zaXRpb24pO1xuICAgICAgICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihuZXdDdXJzb3JQb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSkpO1xuICB9XG5cbiAgX2Rpc2FibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmdldCh0ZXh0RWRpdG9yKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5faW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGNvbHVtbiBvZiB0aGUgY29sb24gdG8gYWxpZ24gd2l0aCwgb3IgbnVsbCBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgc3RhdGljIGdldEluZGVudGVkQ29sb25Db2x1bW4oYnVmZmVyOiBhdG9tJFRleHRCdWZmZXIsIHN0YXJ0UG9zaXRpb246IGF0b20kUG9pbnQpOiA/bnVtYmVyIHtcbiAgICBjb25zdCBzdGFydFBvc2l0aW9uVGV4dCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShSYW5nZS5mcm9tT2JqZWN0KFxuICAgICAgICBbc3RhcnRQb3NpdGlvbiwgc3RhcnRQb3NpdGlvbi50cmFuc2xhdGUoWzAsIDFdKV0pKTtcbiAgICBpZiAoc3RhcnRQb3NpdGlvblRleHQgIT09ICc6Jykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhlIHN0YXJ0IHBvc2l0aW9uIG11c3QgY29udGFpbiBhIGNvbG9uLCBmb3VuZCAnJHtzdGFydFBvc2l0aW9uVGV4dH0nIGluc3RlYWRgKTtcbiAgICB9XG5cbiAgICAvLyBMb29rIGZvciB0aGUgZmlyc3QgY29sb24gYWZ0ZXIgdGhlIHN0YXJ0IG9mIHRoZSBjdXJyZW50IG1ldGhvZC5cbiAgICAvL1xuICAgIC8vIFRoZSBnZW5lcmFsIGFwcHJvYWNoIGlzIHRvIGl0ZXJhdGUgYmFja3dhcmRzLCBjaGVja2luZyBrZXkgY2hhcmFjdGVycy5cbiAgICAvLyBXZSBrZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGNvbG9uIHRoYXQgd2Ugc2VlIChpLmUuIHRoZSBjb2xvbiB0aGF0IGlzXG4gICAgLy8gY2xvc2VzdCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBkb2N1bWVudCkgYW5kIHRlcm1pbmF0ZSBvbmNlIHdlJ3ZlXG4gICAgLy8gcmVhY2hlZCB0aGUgc3RhcnQgb2YgdGhlIG1ldGhvZC5cbiAgICAvL1xuICAgIC8vIFRoaXMgZG9lc24ndCB3b3JrIGlmIHRoZXJlIGFyZSBzdHJpbmdzL2NvbW1lbnRzIHRoYXQgY29udGFpbiBgOmAuXG4gICAgbGV0IGNvbHVtbiA9IG51bGw7XG4gICAgbGV0IG51bWJlck9mVW5jbG9zZWRCcmFja2V0cyA9IDA7XG4gICAgYnVmZmVyLmJhY2t3YXJkc1NjYW5JblJhbmdlKFxuICAgICAgICAvLyBPbmx5IHN0b3AgYXQgdGhlIGtleSBjaGFyYWN0ZXJzOiBgOltdKy1gLlxuICAgICAgICAvOnxcXFt8XFxdfFxcK3wtL2csXG4gICAgICAgIFJhbmdlLmZyb21PYmplY3QoW1xuICAgICAgICAgIHN0YXJ0UG9zaXRpb24udHJhbnNsYXRlKFstTlVNQkVSX09GX1BSRVZJT1VTX0xJTkVTX1RPX1NFQVJDSF9GT1JfQ09MT05TLCAwXSksXG4gICAgICAgICAgc3RhcnRQb3NpdGlvbi50cmFuc2xhdGUoWzAsIC0xXSksXG4gICAgICAgIF0pLFxuICAgICAgICAoe21hdGNoLCBtYXRjaFRleHQsIHJhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gcmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgLy8gSWYgd2UgZmluZCBhIGtleSBjaGFyYWN0ZXIgb24gdGhlIHN0YXJ0aW5nIGxpbmUsIHRoZW4gdGhlIHVzZXIgaXNcbiAgICAgICAgICAvLyB0eXBpbmcgYSBzaW5nbGUtbGluZSBtZXRob2QgKGl0IGRvZXNuJ3QgbmVlZCB0byBiZSBpbmRlbnRlZCkuXG4gICAgICAgICAgY29uc3QgaXNTaW5nbGVMaW5lTWV0aG9kID0gKHBvc2l0aW9uLnJvdyA9PT0gc3RhcnRQb3NpdGlvbi5yb3cpO1xuICAgICAgICAgIC8vIGArYCBvciBgLWAgbWVhbnMgd2UndmUgcmVhY2hlZCB0aGUgc3RhcnQgb2YgYSBtZXRob2QgZGVjbGFyYXRpb24uXG4gICAgICAgICAgY29uc3QgaXNEZWNsYXJhdGlvbiA9IChtYXRjaFRleHQgPT09ICcrJyB8fCBtYXRjaFRleHQgPT09ICctJyk7XG4gICAgICAgICAgaWYgKGlzU2luZ2xlTGluZU1ldGhvZCB8fCBpc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVW5iYWxhbmNlZCBicmFja2V0cyBtZWFuIHdlJ3ZlIHJlYWNoZWQgdGhlIHN0YXJ0IG9mIGEgbWV0aG9kIGNhbGwuXG4gICAgICAgICAgaWYgKG1hdGNoVGV4dCA9PT0gJ1snKSB7XG4gICAgICAgICAgICBudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMtLTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoVGV4dCA9PT0gJ10nKSB7XG4gICAgICAgICAgICBudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG51bWJlck9mVW5jbG9zZWRCcmFja2V0cyA9PT0gLTEpIHtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGNvbG9uIHRoYXQgd2Ugc2VlLlxuICAgICAgICAgIGlmIChtYXRjaFRleHQgPT09ICc6Jykge1xuICAgICAgICAgICAgKHtjb2x1bW59ID0gcG9zaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIGNvbHVtbjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdGl2ZUNDb2xvbkluZGVudGVyO1xuIl19