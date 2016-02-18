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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7eUJBWW1DLGlCQUFpQjs7Ozs7Ozs7OztlQURmLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdDLG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFHakMsSUFBTSxRQUFRLEdBQUcsQ0FDZixhQUFhLEVBQ2IsZUFBZSxDQUNoQixDQUFDOzs7O0FBSUYsSUFBTSw2Q0FBNkMsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7SUFNbkQsdUJBQXVCO1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzs7ZUFBdkIsdUJBQXVCOztXQUlyQixrQkFBUzs7O0FBQ2IsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUU3QyxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUN0RSxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFDLE9BQU8sRUFBRSxtQkFBTTtBQUNoQyxnQkFBSywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO21CQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7V0FBQSxDQUFDLENBQUM7QUFDakYsZ0JBQUssMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDMUMsRUFBQyxDQUFDLENBQUM7O3NCQUVpQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7O1VBQTNELDBCQUEwQixhQUExQiwwQkFBMEI7O0FBQ2pDLG1CQUFhLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUN4QyxRQUFRLEVBQ1IsVUFBQSxVQUFVO2VBQUksTUFBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxFQUNsRCxVQUFBLFVBQVU7ZUFBSSxNQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztPQUFBLENB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NUIsTUFBTSxJQUFJLFNBQVMsS0FBSyxHQUFHLEVBQUU7QUFDNUIsa0NBQXdCLEVBQUUsQ0FBQztTQUM1QjtBQUNELFlBQUksd0JBQXdCLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDbkMsY0FBSSxFQUFFLENBQUM7QUFDUCxpQkFBTztTQUNSOzs7QUFHRCxZQUFJLFNBQVMsS0FBSyxHQUFHLEVBQUU7QUFDbkIsZ0JBQU0sR0FBSSxRQUFRLENBQWxCLE1BQU07U0FDVDtPQUNGLENBQUMsQ0FBQztBQUNQLGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztTQXhKRyx1QkFBdUI7OztBQTJKN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJPYmplY3RpdmVDQ29sb25JbmRlbnRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jb25zdCBHUkFNTUFSUyA9IFtcbiAgJ3NvdXJjZS5vYmpjJyxcbiAgJ3NvdXJjZS5vYmpjcHAnLFxuXTtcblxuLy8gVGhlIGluZGVudGF0aW9uIGFtb3VudCBkZXBlbmRzIG9uIHByZXZpb3VzIGxpbmVzLiBJZiB0aGUgdXNlciB0eXBlcyBhIGNvbG9uIG91dHNpZGUgb2YgYSBtZXRob2Rcbi8vIGNhbGwsIGl0IHNlYXJjaGVzIHRoZSBlbnRpcmUgYnVmZmVyLiBUaGlzIGhhcmQgY3V0b2ZmIHNob3VsZCB3b3JrIGZvciBzYW5lIGNvZGUuXG5jb25zdCBOVU1CRVJfT0ZfUFJFVklPVVNfTElORVNfVE9fU0VBUkNIX0ZPUl9DT0xPTlMgPSAyNTtcblxuLyoqXG4gKiBUaGlzIHByb3ZpZGVzIGltcHJvdmVkIE9iamVjdGl2ZS1DIGluZGVudGF0aW9uIGJ5IGFsaWduaW5nIGNvbG9ucy5cbiAqIENsaWVudHMgbXVzdCBjYWxsIGBkaXNhYmxlKClgIG9uY2UgdGhleSdyZSBkb25lIHdpdGggYW4gaW5zdGFuY2UuXG4gKi9cbmNsYXNzIE9iamVjdGl2ZUNDb2xvbkluZGVudGVyIHtcbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBJRGlzcG9zYWJsZT47XG5cbiAgZW5hYmxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKHtkaXNwb3NlOiAoKSA9PiB7XG4gICAgICB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmNsZWFyKCk7XG4gICAgfX0pO1xuXG4gICAgY29uc3Qge29ic2VydmVMYW5ndWFnZVRleHRFZGl0b3JzfSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKG9ic2VydmVMYW5ndWFnZVRleHRFZGl0b3JzKFxuICAgICAgICBHUkFNTUFSUyxcbiAgICAgICAgdGV4dEVkaXRvciA9PiB0aGlzLl9lbmFibGVJblRleHRFZGl0b3IodGV4dEVkaXRvciksXG4gICAgICAgIHRleHRFZGl0b3IgPT4gdGhpcy5fZGlzYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSkpO1xuICB9XG5cbiAgZGlzYWJsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfZW5hYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5zZXQodGV4dEVkaXRvciwgdGV4dEVkaXRvci5vbkRpZEluc2VydFRleHQoZXZlbnQgPT4ge1xuICAgICAgdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICAgICdvYmpjOmluZGVudC1jb2xvbicsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBjb25zdCB7cmFuZ2UsIHRleHR9ID0gZXZlbnQ7XG5cbiAgICAgICAgICAvLyBJZ25vcmUgdGhlIGluc2VydGVkIHRleHQgaWYgdGhlIHVzZXIgaXMgdHlwaW5nIGluIGEgc3RyaW5nIG9yIGNvbW1lbnQuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBUaGUgc2NvcGUgZGVzY3JpcHRvciBtYXJrcyB0aGUgdGV4dCB3aXRoIHNlbWFudGljIGluZm9ybWF0aW9uLFxuICAgICAgICAgIC8vIGdlbmVyYWxseSB1c2VkIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgICAgICAgIGNvbnN0IGlzTm9uQ29kZVRleHQgPSB0ZXh0RWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgICAgLmdldFNjb3Blc0FycmF5KClcbiAgICAgICAgICAgIC5zb21lKHNjb3BlID0+IHNjb3BlLnN0YXJ0c1dpdGgoJ3N0cmluZycpIHx8IHNjb3BlLnN0YXJ0c1dpdGgoJ2NvbW1lbnQnKSk7XG4gICAgICAgICAgaWYgKHRleHQgIT09ICc6JyB8fCBpc05vbkNvZGVUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgYnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKTtcblxuICAgICAgICAgIGNvbnN0IGN1cnJlbnRDb2xvblBvc2l0aW9uID0gcmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgY29uc3QgY29sb25Db2x1bW4gPVxuICAgICAgICAgIE9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmdldEluZGVudGVkQ29sb25Db2x1bW4oYnVmZmVyLCBjdXJyZW50Q29sb25Qb3NpdGlvbik7XG4gICAgICAgICAgaWYgKCFjb2xvbkNvbHVtbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZ1bGx5IHJlcGxhY2UgdGhlIGN1cnJlbnQgbGluZSB3aXRoIHRoZSBwcm9wZXJseS1pbmRlbnRlZCBsaW5lLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gMS4gR2V0IHRoZSBjdXJyZW50IGxpbmUgYW5kIHN0cmlwIGFsbCB0aGUgaW5kZW50YXRpb24uXG4gICAgICAgICAgY29uc3QgbGluZSA9IGJ1ZmZlci5saW5lRm9yUm93KGN1cnJlbnRDb2xvblBvc2l0aW9uLnJvdyk7XG4gICAgICAgICAgLy8gJEZsb3dJc3N1ZSBUaGlzIG5lZWRzIHRvIGJlIGFkZGVkIHRvIGxpYi9jb3JlLmpzLlxuICAgICAgICAgIGNvbnN0IHVuaW5kZW50ZWRMaW5lID0gbGluZS50cmltTGVmdCgpO1xuICAgICAgICAgIC8vIDIuIENhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIGluZGVudGF0aW9uIHRoZSBsaW5lIHNob3VsZCBlbmQgdXAgd2l0aC5cbiAgICAgICAgICBjb25zdCBudW1iZXJPZkluZGVudENoYXJhY3RlcnMgPSBsaW5lLmxlbmd0aCAtIHVuaW5kZW50ZWRMaW5lLmxlbmd0aDtcbiAgICAgICAgICBjb25zdCB1bmluZGVudGVkQ3VycmVudENvbG9uQ29sdW1uID1cbiAgICAgICAgICAgIGN1cnJlbnRDb2xvblBvc2l0aW9uLmNvbHVtbiAtIG51bWJlck9mSW5kZW50Q2hhcmFjdGVycztcbiAgICAgICAgICBjb25zdCB0b3RhbEluZGVudEFtb3VudCA9IHVuaW5kZW50ZWRDdXJyZW50Q29sb25Db2x1bW4gPj0gY29sb25Db2x1bW5cbiAgICAgICAgICAgID8gMFxuICAgICAgICAgICAgOiBjb2xvbkNvbHVtbiAtIHVuaW5kZW50ZWRDdXJyZW50Q29sb25Db2x1bW47XG4gICAgICAgICAgLy8gMy4gUmVwbGFjZSB0aGUgY3VycmVudCBsaW5lIHdpdGggdGhlIHByb3Blcmx5LWluZGVudGVkIGxpbmUuXG4gICAgICAgICAgdGV4dEVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShcbiAgICAgICAgICAgIGJ1ZmZlci5yYW5nZUZvclJvdyhjdXJyZW50Q29sb25Qb3NpdGlvbi5yb3csIC8qIGluY2x1ZGVOZXdsaW5lICovIGZhbHNlKSxcbiAgICAgICAgICAgICcgJy5yZXBlYXQodG90YWxJbmRlbnRBbW91bnQpICsgdW5pbmRlbnRlZExpbmUpO1xuXG4gICAgICAgICAgLy8gTW92ZSB0aGUgY3Vyc29yIHRvIHJpZ2h0IGFmdGVyIHRoZSBpbnNlcnRlZCBjb2xvbi5cbiAgICAgICAgICBjb25zdCBuZXdDdXJzb3JQb3NpdGlvbiA9IFtcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvblBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgIHRvdGFsSW5kZW50QW1vdW50ICsgdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbiArIDEsXG4gICAgICAgICAgXTtcbiAgICAgICAgICB0ZXh0RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ld0N1cnNvclBvc2l0aW9uKTtcbiAgICAgICAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24obmV3Q3Vyc29yUG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pKTtcbiAgfVxuXG4gIF9kaXNhYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5nZXQodGV4dEVkaXRvcik7XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBjb2x1bW4gb2YgdGhlIGNvbG9uIHRvIGFsaWduIHdpdGgsIG9yIG51bGwgaWYgaXQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIHN0YXRpYyBnZXRJbmRlbnRlZENvbG9uQ29sdW1uKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyLCBzdGFydFBvc2l0aW9uOiBhdG9tJFBvaW50KTogP251bWJlciB7XG4gICAgY29uc3Qgc3RhcnRQb3NpdGlvblRleHQgPSBidWZmZXIuZ2V0VGV4dEluUmFuZ2UoUmFuZ2UuZnJvbU9iamVjdChcbiAgICAgICAgW3N0YXJ0UG9zaXRpb24sIHN0YXJ0UG9zaXRpb24udHJhbnNsYXRlKFswLCAxXSldKSk7XG4gICAgaWYgKHN0YXJ0UG9zaXRpb25UZXh0ICE9PSAnOicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBzdGFydCBwb3NpdGlvbiBtdXN0IGNvbnRhaW4gYSBjb2xvbiwgZm91bmQgJyR7c3RhcnRQb3NpdGlvblRleHR9JyBpbnN0ZWFkYCk7XG4gICAgfVxuXG4gICAgLy8gTG9vayBmb3IgdGhlIGZpcnN0IGNvbG9uIGFmdGVyIHRoZSBzdGFydCBvZiB0aGUgY3VycmVudCBtZXRob2QuXG4gICAgLy9cbiAgICAvLyBUaGUgZ2VuZXJhbCBhcHByb2FjaCBpcyB0byBpdGVyYXRlIGJhY2t3YXJkcywgY2hlY2tpbmcga2V5IGNoYXJhY3RlcnMuXG4gICAgLy8gV2Uga2VlcCB0cmFjayBvZiB0aGUgbGFzdCBjb2xvbiB0aGF0IHdlIHNlZSAoaS5lLiB0aGUgY29sb24gdGhhdCBpc1xuICAgIC8vIGNsb3Nlc3QgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgZG9jdW1lbnQpIGFuZCB0ZXJtaW5hdGUgb25jZSB3ZSd2ZVxuICAgIC8vIHJlYWNoZWQgdGhlIHN0YXJ0IG9mIHRoZSBtZXRob2QuXG4gICAgLy9cbiAgICAvLyBUaGlzIGRvZXNuJ3Qgd29yayBpZiB0aGVyZSBhcmUgc3RyaW5ncy9jb21tZW50cyB0aGF0IGNvbnRhaW4gYDpgLlxuICAgIGxldCBjb2x1bW4gPSBudWxsO1xuICAgIGxldCBudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMgPSAwO1xuICAgIGJ1ZmZlci5iYWNrd2FyZHNTY2FuSW5SYW5nZShcbiAgICAgICAgLy8gT25seSBzdG9wIGF0IHRoZSBrZXkgY2hhcmFjdGVyczogYDpbXSstYC5cbiAgICAgICAgLzp8XFxbfFxcXXxcXCt8LS9nLFxuICAgICAgICBSYW5nZS5mcm9tT2JqZWN0KFtcbiAgICAgICAgICBzdGFydFBvc2l0aW9uLnRyYW5zbGF0ZShbLU5VTUJFUl9PRl9QUkVWSU9VU19MSU5FU19UT19TRUFSQ0hfRk9SX0NPTE9OUywgMF0pLFxuICAgICAgICAgIHN0YXJ0UG9zaXRpb24udHJhbnNsYXRlKFswLCAtMV0pLFxuICAgICAgICBdKSxcbiAgICAgICAgKHttYXRjaCwgbWF0Y2hUZXh0LCByYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHJhbmdlLnN0YXJ0O1xuICAgICAgICAgIC8vIElmIHdlIGZpbmQgYSBrZXkgY2hhcmFjdGVyIG9uIHRoZSBzdGFydGluZyBsaW5lLCB0aGVuIHRoZSB1c2VyIGlzXG4gICAgICAgICAgLy8gdHlwaW5nIGEgc2luZ2xlLWxpbmUgbWV0aG9kIChpdCBkb2Vzbid0IG5lZWQgdG8gYmUgaW5kZW50ZWQpLlxuICAgICAgICAgIGNvbnN0IGlzU2luZ2xlTGluZU1ldGhvZCA9IChwb3NpdGlvbi5yb3cgPT09IHN0YXJ0UG9zaXRpb24ucm93KTtcbiAgICAgICAgICAvLyBgK2Agb3IgYC1gIG1lYW5zIHdlJ3ZlIHJlYWNoZWQgdGhlIHN0YXJ0IG9mIGEgbWV0aG9kIGRlY2xhcmF0aW9uLlxuICAgICAgICAgIGNvbnN0IGlzRGVjbGFyYXRpb24gPSAobWF0Y2hUZXh0ID09PSAnKycgfHwgbWF0Y2hUZXh0ID09PSAnLScpO1xuICAgICAgICAgIGlmIChpc1NpbmdsZUxpbmVNZXRob2QgfHwgaXNEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVuYmFsYW5jZWQgYnJhY2tldHMgbWVhbiB3ZSd2ZSByZWFjaGVkIHRoZSBzdGFydCBvZiBhIG1ldGhvZCBjYWxsLlxuICAgICAgICAgIGlmIChtYXRjaFRleHQgPT09ICdbJykge1xuICAgICAgICAgICAgbnVtYmVyT2ZVbmNsb3NlZEJyYWNrZXRzLS07XG4gICAgICAgICAgfSBlbHNlIGlmIChtYXRjaFRleHQgPT09ICddJykge1xuICAgICAgICAgICAgbnVtYmVyT2ZVbmNsb3NlZEJyYWNrZXRzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMgPT09IC0xKSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgbGFzdCBjb2xvbiB0aGF0IHdlIHNlZS5cbiAgICAgICAgICBpZiAobWF0Y2hUZXh0ID09PSAnOicpIHtcbiAgICAgICAgICAgICh7Y29sdW1ufSA9IHBvc2l0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBjb2x1bW47XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RpdmVDQ29sb25JbmRlbnRlcjtcbiJdfQ==