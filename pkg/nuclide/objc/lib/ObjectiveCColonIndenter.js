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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7eUJBWW1DLGlCQUFpQjs7Ozs7Ozs7OztlQURmLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdDLG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFHakMsSUFBTSxRQUFRLEdBQUcsQ0FDZixhQUFhLEVBQ2IsZUFBZSxDQUNoQixDQUFDOzs7O0FBSUYsSUFBTSw2Q0FBNkMsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7SUFNbkQsdUJBQXVCO1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzs7ZUFBdkIsdUJBQXVCOztXQUlyQixrQkFBUzs7O0FBQ2IsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUU3QyxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUN0RSxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFDLE9BQU8sRUFBRSxtQkFBTTtBQUNoQyxnQkFBSywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsVUFBQyxZQUFZO21CQUFLLFlBQVksQ0FBQyxPQUFPLEVBQUU7V0FBQSxDQUFDLENBQUM7QUFDbkYsZ0JBQUssMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDMUMsRUFBQyxDQUFDLENBQUM7O3NCQUVpQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7O1VBQTNELDBCQUEwQixhQUExQiwwQkFBMEI7O0FBQ2pDLG1CQUFhLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUN4QyxRQUFRLEVBQ1IsVUFBQSxVQUFVO2VBQUksTUFBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxFQUNsRCxVQUFBLFVBQVU7ZUFBSSxNQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztPQUFBLENB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QixNQUFNLElBQUksU0FBUyxLQUFLLEdBQUcsRUFBRTtBQUM1QixrQ0FBd0IsRUFBRSxDQUFDO1NBQzVCO0FBQ0QsWUFBSSx3QkFBd0IsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNuQyxjQUFJLEVBQUUsQ0FBQztBQUNQLGlCQUFPO1NBQ1I7OztBQUdELFlBQUksU0FBUyxLQUFLLEdBQUcsRUFBRTtBQUNuQixnQkFBTSxHQUFJLFFBQVEsQ0FBbEIsTUFBTTtTQUNUO09BQ0YsQ0FBQyxDQUFDO0FBQ1AsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBdkpHLHVCQUF1Qjs7O0FBMEo3QixNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6Ik9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IEdSQU1NQVJTID0gW1xuICAnc291cmNlLm9iamMnLFxuICAnc291cmNlLm9iamNwcCcsXG5dO1xuXG4vLyBUaGUgaW5kZW50YXRpb24gYW1vdW50IGRlcGVuZHMgb24gcHJldmlvdXMgbGluZXMuIElmIHRoZSB1c2VyIHR5cGVzIGEgY29sb24gb3V0c2lkZSBvZiBhIG1ldGhvZFxuLy8gY2FsbCwgaXQgc2VhcmNoZXMgdGhlIGVudGlyZSBidWZmZXIuIFRoaXMgaGFyZCBjdXRvZmYgc2hvdWxkIHdvcmsgZm9yIHNhbmUgY29kZS5cbmNvbnN0IE5VTUJFUl9PRl9QUkVWSU9VU19MSU5FU19UT19TRUFSQ0hfRk9SX0NPTE9OUyA9IDI1O1xuXG4vKipcbiAqIFRoaXMgcHJvdmlkZXMgaW1wcm92ZWQgT2JqZWN0aXZlLUMgaW5kZW50YXRpb24gYnkgYWxpZ25pbmcgY29sb25zLlxuICogQ2xpZW50cyBtdXN0IGNhbGwgYGRpc2FibGUoKWAgb25jZSB0aGV5J3JlIGRvbmUgd2l0aCBhbiBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIge1xuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcDogTWFwPFRleHRFZGl0b3IsIElEaXNwb3NhYmxlPjtcblxuICBlbmFibGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoe2Rpc3Bvc2U6ICgpID0+IHtcbiAgICAgIHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKSk7XG4gICAgICB0aGlzLl9pbnNlcnRUZXh0U3Vic2NyaXB0aW9uc01hcC5jbGVhcigpO1xuICAgIH19KTtcblxuICAgIGNvbnN0IHtvYnNlcnZlTGFuZ3VhZ2VUZXh0RWRpdG9yc30gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChvYnNlcnZlTGFuZ3VhZ2VUZXh0RWRpdG9ycyhcbiAgICAgICAgR1JBTU1BUlMsXG4gICAgICAgIHRleHRFZGl0b3IgPT4gdGhpcy5fZW5hYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3IpLFxuICAgICAgICB0ZXh0RWRpdG9yID0+IHRoaXMuX2Rpc2FibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcikpKTtcbiAgfVxuXG4gIGRpc2FibGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2VuYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5faW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXAuc2V0KHRleHRFZGl0b3IsIHRleHRFZGl0b3Iub25EaWRJbnNlcnRUZXh0KChldmVudCkgPT4ge1xuICAgICAgdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICAgICdvYmpjOmluZGVudC1jb2xvbicsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBjb25zdCB7cmFuZ2UsIHRleHR9ID0gZXZlbnQ7XG5cbiAgICAgICAgICAvLyBJZ25vcmUgdGhlIGluc2VydGVkIHRleHQgaWYgdGhlIHVzZXIgaXMgdHlwaW5nIGluIGEgc3RyaW5nIG9yIGNvbW1lbnQuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBUaGUgc2NvcGUgZGVzY3JpcHRvciBtYXJrcyB0aGUgdGV4dCB3aXRoIHNlbWFudGljIGluZm9ybWF0aW9uLFxuICAgICAgICAgIC8vIGdlbmVyYWxseSB1c2VkIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgICAgICAgIGNvbnN0IGlzTm9uQ29kZVRleHQgPSB0ZXh0RWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgICAgLmdldFNjb3Blc0FycmF5KClcbiAgICAgICAgICAgIC5zb21lKHNjb3BlID0+IHNjb3BlLnN0YXJ0c1dpdGgoJ3N0cmluZycpIHx8IHNjb3BlLnN0YXJ0c1dpdGgoJ2NvbW1lbnQnKSk7XG4gICAgICAgICAgaWYgKHRleHQgIT09ICc6JyB8fCBpc05vbkNvZGVUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgYnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKTtcblxuICAgICAgICAgIGNvbnN0IGN1cnJlbnRDb2xvblBvc2l0aW9uID0gcmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgY29uc3QgY29sb25Db2x1bW4gPVxuICAgICAgICAgIE9iamVjdGl2ZUNDb2xvbkluZGVudGVyLmdldEluZGVudGVkQ29sb25Db2x1bW4oYnVmZmVyLCBjdXJyZW50Q29sb25Qb3NpdGlvbik7XG4gICAgICAgICAgaWYgKCFjb2xvbkNvbHVtbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZ1bGx5IHJlcGxhY2UgdGhlIGN1cnJlbnQgbGluZSB3aXRoIHRoZSBwcm9wZXJseS1pbmRlbnRlZCBsaW5lLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gMS4gR2V0IHRoZSBjdXJyZW50IGxpbmUgYW5kIHN0cmlwIGFsbCB0aGUgaW5kZW50YXRpb24uXG4gICAgICAgICAgY29uc3QgbGluZSA9IGJ1ZmZlci5saW5lRm9yUm93KGN1cnJlbnRDb2xvblBvc2l0aW9uLnJvdyk7XG4gICAgICAgICAgLy8gJEZsb3dJc3N1ZSBUaGlzIG5lZWRzIHRvIGJlIGFkZGVkIHRvIGxpYi9jb3JlLmpzLlxuICAgICAgICAgIGNvbnN0IHVuaW5kZW50ZWRMaW5lID0gbGluZS50cmltTGVmdCgpO1xuICAgICAgICAgIC8vIDIuIENhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIGluZGVudGF0aW9uIHRoZSBsaW5lIHNob3VsZCBlbmQgdXAgd2l0aC5cbiAgICAgICAgICBjb25zdCBudW1iZXJPZkluZGVudENoYXJhY3RlcnMgPSBsaW5lLmxlbmd0aCAtIHVuaW5kZW50ZWRMaW5lLmxlbmd0aDtcbiAgICAgICAgICBjb25zdCB1bmluZGVudGVkQ3VycmVudENvbG9uQ29sdW1uID0gY3VycmVudENvbG9uUG9zaXRpb24uY29sdW1uIC0gbnVtYmVyT2ZJbmRlbnRDaGFyYWN0ZXJzO1xuICAgICAgICAgIGNvbnN0IHRvdGFsSW5kZW50QW1vdW50ID0gdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbiA+PSBjb2xvbkNvbHVtblxuICAgICAgICAgICAgPyAwXG4gICAgICAgICAgICA6IGNvbG9uQ29sdW1uIC0gdW5pbmRlbnRlZEN1cnJlbnRDb2xvbkNvbHVtbjtcbiAgICAgICAgICAvLyAzLiBSZXBsYWNlIHRoZSBjdXJyZW50IGxpbmUgd2l0aCB0aGUgcHJvcGVybHktaW5kZW50ZWQgbGluZS5cbiAgICAgICAgICB0ZXh0RWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFxuICAgICAgICAgICAgYnVmZmVyLnJhbmdlRm9yUm93KGN1cnJlbnRDb2xvblBvc2l0aW9uLnJvdywgLyogaW5jbHVkZU5ld2xpbmUgKi8gZmFsc2UpLFxuICAgICAgICAgICAgJyAnLnJlcGVhdCh0b3RhbEluZGVudEFtb3VudCkgKyB1bmluZGVudGVkTGluZSk7XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBjdXJzb3IgdG8gcmlnaHQgYWZ0ZXIgdGhlIGluc2VydGVkIGNvbG9uLlxuICAgICAgICAgIGNvbnN0IG5ld0N1cnNvclBvc2l0aW9uID0gW1xuICAgICAgICAgICAgY3VycmVudENvbG9uUG9zaXRpb24ucm93LFxuICAgICAgICAgICAgdG90YWxJbmRlbnRBbW91bnQgKyB1bmluZGVudGVkQ3VycmVudENvbG9uQ29sdW1uICsgMSxcbiAgICAgICAgICBdO1xuICAgICAgICAgIHRleHRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3Q3Vyc29yUG9zaXRpb24pO1xuICAgICAgICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihuZXdDdXJzb3JQb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSkpO1xuICB9XG5cbiAgX2Rpc2FibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2luc2VydFRleHRTdWJzY3JpcHRpb25zTWFwLmdldCh0ZXh0RWRpdG9yKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5faW5zZXJ0VGV4dFN1YnNjcmlwdGlvbnNNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGNvbHVtbiBvZiB0aGUgY29sb24gdG8gYWxpZ24gd2l0aCwgb3IgbnVsbCBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgc3RhdGljIGdldEluZGVudGVkQ29sb25Db2x1bW4oYnVmZmVyOiBhdG9tJFRleHRCdWZmZXIsIHN0YXJ0UG9zaXRpb246IGF0b20kUG9pbnQpOiA/bnVtYmVyIHtcbiAgICBjb25zdCBzdGFydFBvc2l0aW9uVGV4dCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShSYW5nZS5mcm9tT2JqZWN0KFxuICAgICAgICBbc3RhcnRQb3NpdGlvbiwgc3RhcnRQb3NpdGlvbi50cmFuc2xhdGUoWzAsIDFdKV0pKTtcbiAgICBpZiAoc3RhcnRQb3NpdGlvblRleHQgIT09ICc6Jykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhlIHN0YXJ0IHBvc2l0aW9uIG11c3QgY29udGFpbiBhIGNvbG9uLCBmb3VuZCAnJHtzdGFydFBvc2l0aW9uVGV4dH0nIGluc3RlYWRgKTtcbiAgICB9XG5cbiAgICAvLyBMb29rIGZvciB0aGUgZmlyc3QgY29sb24gYWZ0ZXIgdGhlIHN0YXJ0IG9mIHRoZSBjdXJyZW50IG1ldGhvZC5cbiAgICAvL1xuICAgIC8vIFRoZSBnZW5lcmFsIGFwcHJvYWNoIGlzIHRvIGl0ZXJhdGUgYmFja3dhcmRzLCBjaGVja2luZyBrZXkgY2hhcmFjdGVycy5cbiAgICAvLyBXZSBrZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGNvbG9uIHRoYXQgd2Ugc2VlIChpLmUuIHRoZSBjb2xvbiB0aGF0IGlzXG4gICAgLy8gY2xvc2VzdCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBkb2N1bWVudCkgYW5kIHRlcm1pbmF0ZSBvbmNlIHdlJ3ZlXG4gICAgLy8gcmVhY2hlZCB0aGUgc3RhcnQgb2YgdGhlIG1ldGhvZC5cbiAgICAvL1xuICAgIC8vIFRoaXMgZG9lc24ndCB3b3JrIGlmIHRoZXJlIGFyZSBzdHJpbmdzL2NvbW1lbnRzIHRoYXQgY29udGFpbiBgOmAuXG4gICAgbGV0IGNvbHVtbiA9IG51bGw7XG4gICAgbGV0IG51bWJlck9mVW5jbG9zZWRCcmFja2V0cyA9IDA7XG4gICAgYnVmZmVyLmJhY2t3YXJkc1NjYW5JblJhbmdlKFxuICAgICAgICAvLyBPbmx5IHN0b3AgYXQgdGhlIGtleSBjaGFyYWN0ZXJzOiBgOltdKy1gLlxuICAgICAgICAvOnxcXFt8XFxdfFxcK3wtL2csXG4gICAgICAgIFJhbmdlLmZyb21PYmplY3QoW1xuICAgICAgICAgIHN0YXJ0UG9zaXRpb24udHJhbnNsYXRlKFstTlVNQkVSX09GX1BSRVZJT1VTX0xJTkVTX1RPX1NFQVJDSF9GT1JfQ09MT05TLCAwXSksXG4gICAgICAgICAgc3RhcnRQb3NpdGlvbi50cmFuc2xhdGUoWzAsIC0xXSksXG4gICAgICAgIF0pLFxuICAgICAgICAoe21hdGNoLCBtYXRjaFRleHQsIHJhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gcmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgLy8gSWYgd2UgZmluZCBhIGtleSBjaGFyYWN0ZXIgb24gdGhlIHN0YXJ0aW5nIGxpbmUsIHRoZW4gdGhlIHVzZXIgaXNcbiAgICAgICAgICAvLyB0eXBpbmcgYSBzaW5nbGUtbGluZSBtZXRob2QgKGl0IGRvZXNuJ3QgbmVlZCB0byBiZSBpbmRlbnRlZCkuXG4gICAgICAgICAgY29uc3QgaXNTaW5nbGVMaW5lTWV0aG9kID0gKHBvc2l0aW9uLnJvdyA9PT0gc3RhcnRQb3NpdGlvbi5yb3cpO1xuICAgICAgICAgIC8vIGArYCBvciBgLWAgbWVhbnMgd2UndmUgcmVhY2hlZCB0aGUgc3RhcnQgb2YgYSBtZXRob2QgZGVjbGFyYXRpb24uXG4gICAgICAgICAgY29uc3QgaXNEZWNsYXJhdGlvbiA9IChtYXRjaFRleHQgPT09ICcrJyB8fCBtYXRjaFRleHQgPT09ICctJyk7XG4gICAgICAgICAgaWYgKGlzU2luZ2xlTGluZU1ldGhvZCB8fCBpc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVW5iYWxhbmNlZCBicmFja2V0cyBtZWFuIHdlJ3ZlIHJlYWNoZWQgdGhlIHN0YXJ0IG9mIGEgbWV0aG9kIGNhbGwuXG4gICAgICAgICAgaWYgKG1hdGNoVGV4dCA9PT0gJ1snKSB7XG4gICAgICAgICAgICBudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMtLTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoVGV4dCA9PT0gJ10nKSB7XG4gICAgICAgICAgICBudW1iZXJPZlVuY2xvc2VkQnJhY2tldHMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG51bWJlck9mVW5jbG9zZWRCcmFja2V0cyA9PT0gLTEpIHtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGNvbG9uIHRoYXQgd2Ugc2VlLlxuICAgICAgICAgIGlmIChtYXRjaFRleHQgPT09ICc6Jykge1xuICAgICAgICAgICAgKHtjb2x1bW59ID0gcG9zaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIGNvbHVtbjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdGl2ZUNDb2xvbkluZGVudGVyO1xuIl19