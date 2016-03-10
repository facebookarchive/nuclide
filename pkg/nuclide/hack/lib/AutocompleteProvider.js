var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _analytics = require('../../analytics');

var _hack = require('./hack');

var FIELD_ACCESSORS = ['->', '::'];
var PREFIX_LOOKBACK = Math.max.apply(null, FIELD_ACCESSORS.map(function (prefix) {
  return prefix.length;
}));

var AutocompleteProvider = (function () {
  function AutocompleteProvider() {
    _classCallCheck(this, AutocompleteProvider);
  }

  /**
   * Returns true if `bufferPosition` is prefixed with any of the passed `checkPrefixes`.
   */

  _createDecoratedClass(AutocompleteProvider, [{
    key: 'getAutocompleteSuggestions',
    decorators: [(0, _analytics.trackTiming)('hack.getAutocompleteSuggestions')],
    value: _asyncToGenerator(function* (request) {
      var editor = request.editor;
      var bufferPosition = request.bufferPosition;

      var replacementPrefix = findHackPrefix(editor);

      if (!replacementPrefix && !hasPrefix(editor, bufferPosition, FIELD_ACCESSORS, PREFIX_LOOKBACK)) {
        return [];
      }

      var completions = yield (0, _hack.fetchCompletionsForEditor)(editor, replacementPrefix);

      return completions.map(function (completion) {
        return {
          snippet: completion.matchSnippet,
          replacementPrefix: replacementPrefix,
          rightLabel: completion.matchType
        };
      });
    })
  }]);

  return AutocompleteProvider;
})();

function hasPrefix(editor, bufferPosition, checkPrefixes, prefixLookback) {
  var priorChars = editor.getTextInBufferRange(new _atom.Range(new _atom.Point(bufferPosition.row, bufferPosition.column - prefixLookback), bufferPosition));
  return checkPrefixes.some(function (prefix) {
    return priorChars.endsWith(prefix);
  });
}

function findHackPrefix(editor) {
  var cursor = editor.getLastCursor();
  // We use custom wordRegex to adopt php variables starting with $.
  var currentRange = cursor.getCurrentWordBufferRange({ wordRegex: /(\$\w*)|\w+/ });
  // Current word might go beyond the cursor, so we cut it.
  var range = new _atom.Range(currentRange.start, new _atom.Point(cursor.getBufferRow(), cursor.getBufferColumn()));
  var prefix = editor.getTextInBufferRange(range).trim();
  // Prefix could just be $ or ends with string literal.
  if (prefix === '$' || !/[\W]$/.test(prefix)) {
    return prefix;
  } else {
    return '';
  }
}

module.exports = AutocompleteProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQVcyQixNQUFNOzt5QkFDUCxpQkFBaUI7O29CQUNILFFBQVE7O0FBRWhELElBQU0sZUFBZSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTTtTQUFJLE1BQU0sQ0FBQyxNQUFNO0NBQUEsQ0FBQyxDQUFDLENBQUM7O0lBRXJGLG9CQUFvQjtXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7Ozs7Ozt3QkFBcEIsb0JBQW9COztpQkFFdkIsNEJBQVksaUNBQWlDLENBQUM7NkJBQ2YsV0FDOUIsT0FBaUMsRUFDYTtVQUN2QyxNQUFNLEdBQW9CLE9BQU8sQ0FBakMsTUFBTTtVQUFFLGNBQWMsR0FBSSxPQUFPLENBQXpCLGNBQWM7O0FBQzdCLFVBQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVqRCxVQUFJLENBQUMsaUJBQWlCLElBQ2pCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxFQUFFO0FBQ3pFLGVBQU8sRUFBRSxDQUFDO09BQ1g7O0FBRUQsVUFBTSxXQUFXLEdBQUcsTUFBTSxxQ0FBMEIsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7O0FBRS9FLGFBQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUNuQyxlQUFPO0FBQ0wsaUJBQU8sRUFBRSxVQUFVLENBQUMsWUFBWTtBQUNoQywyQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG9CQUFVLEVBQUUsVUFBVSxDQUFDLFNBQVM7U0FDakMsQ0FBQztPQUNILENBQUMsQ0FBQztLQUNKOzs7U0F2Qkcsb0JBQW9COzs7QUE2QjFCLFNBQVMsU0FBUyxDQUNkLE1BQXVCLEVBQ3ZCLGNBQTBCLEVBQzFCLGFBQTRCLEVBQzVCLGNBQXNCLEVBQ2I7QUFDWCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsZ0JBQzdDLGdCQUFVLGNBQWMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsRUFDckUsY0FBYyxDQUNmLENBQUMsQ0FBQztBQUNILFNBQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU07V0FBSSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztHQUFBLENBQUMsQ0FBQztDQUNsRTs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxNQUF1QixFQUFVO0FBQ3ZELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFdEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLEVBQUMsU0FBUyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUM7O0FBRWpGLE1BQU0sS0FBSyxHQUFHLGdCQUNWLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLGdCQUFVLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFekQsTUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQyxXQUFPLE1BQU0sQ0FBQztHQUNmLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyIsImZpbGUiOiJBdXRvY29tcGxldGVQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UG9pbnQsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2ZldGNoQ29tcGxldGlvbnNGb3JFZGl0b3J9IGZyb20gJy4vaGFjayc7XG5cbmNvbnN0IEZJRUxEX0FDQ0VTU09SUyA9IFsnLT4nLCAnOjonXTtcbmNvbnN0IFBSRUZJWF9MT09LQkFDSyA9IE1hdGgubWF4LmFwcGx5KG51bGwsIEZJRUxEX0FDQ0VTU09SUy5tYXAocHJlZml4ID0+IHByZWZpeC5sZW5ndGgpKTtcblxuY2xhc3MgQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuXG4gIEB0cmFja1RpbWluZygnaGFjay5nZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucycpXG4gIGFzeW5jIGdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKFxuICAgIHJlcXVlc3Q6IGF0b20kQXV0b2NvbXBsZXRlUmVxdWVzdCxcbiAgKTogUHJvbWlzZTw/QXJyYXk8YXRvbSRBdXRvY29tcGxldGVTdWdnZXN0aW9uPj4ge1xuICAgIGNvbnN0IHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9ufSA9IHJlcXVlc3Q7XG4gICAgY29uc3QgcmVwbGFjZW1lbnRQcmVmaXggPSBmaW5kSGFja1ByZWZpeChlZGl0b3IpO1xuXG4gICAgaWYgKCFyZXBsYWNlbWVudFByZWZpeFxuICAgICAgJiYgIWhhc1ByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBGSUVMRF9BQ0NFU1NPUlMsIFBSRUZJWF9MT09LQkFDSykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wbGV0aW9ucyA9IGF3YWl0IGZldGNoQ29tcGxldGlvbnNGb3JFZGl0b3IoZWRpdG9yLCByZXBsYWNlbWVudFByZWZpeCk7XG5cbiAgICByZXR1cm4gY29tcGxldGlvbnMubWFwKGNvbXBsZXRpb24gPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc25pcHBldDogY29tcGxldGlvbi5tYXRjaFNuaXBwZXQsXG4gICAgICAgIHJlcGxhY2VtZW50UHJlZml4LFxuICAgICAgICByaWdodExhYmVsOiBjb21wbGV0aW9uLm1hdGNoVHlwZSxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYGJ1ZmZlclBvc2l0aW9uYCBpcyBwcmVmaXhlZCB3aXRoIGFueSBvZiB0aGUgcGFzc2VkIGBjaGVja1ByZWZpeGVzYC5cbiAqL1xuZnVuY3Rpb24gaGFzUHJlZml4KFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIGJ1ZmZlclBvc2l0aW9uOiBhdG9tJFBvaW50LFxuICAgIGNoZWNrUHJlZml4ZXM6IEFycmF5PHN0cmluZz4sXG4gICAgcHJlZml4TG9va2JhY2s6IG51bWJlcixcbiAgKTogYm9vbGVhbiB7XG4gIGNvbnN0IHByaW9yQ2hhcnMgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UobmV3IFJhbmdlKFxuICAgIG5ldyBQb2ludChidWZmZXJQb3NpdGlvbi5yb3csIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIHByZWZpeExvb2tiYWNrKSxcbiAgICBidWZmZXJQb3NpdGlvblxuICApKTtcbiAgcmV0dXJuIGNoZWNrUHJlZml4ZXMuc29tZShwcmVmaXggPT4gcHJpb3JDaGFycy5lbmRzV2l0aChwcmVmaXgpKTtcbn1cblxuZnVuY3Rpb24gZmluZEhhY2tQcmVmaXgoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBzdHJpbmcge1xuICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAvLyBXZSB1c2UgY3VzdG9tIHdvcmRSZWdleCB0byBhZG9wdCBwaHAgdmFyaWFibGVzIHN0YXJ0aW5nIHdpdGggJC5cbiAgY29uc3QgY3VycmVudFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uoe3dvcmRSZWdleDovKFxcJFxcdyopfFxcdysvfSk7XG4gIC8vIEN1cnJlbnQgd29yZCBtaWdodCBnbyBiZXlvbmQgdGhlIGN1cnNvciwgc28gd2UgY3V0IGl0LlxuICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgIGN1cnJlbnRSYW5nZS5zdGFydCxcbiAgICAgIG5ldyBQb2ludChjdXJzb3IuZ2V0QnVmZmVyUm93KCksIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSkpO1xuICBjb25zdCBwcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpLnRyaW0oKTtcbiAgLy8gUHJlZml4IGNvdWxkIGp1c3QgYmUgJCBvciBlbmRzIHdpdGggc3RyaW5nIGxpdGVyYWwuXG4gIGlmIChwcmVmaXggPT09ICckJyB8fCAhL1tcXFddJC8udGVzdChwcmVmaXgpKSB7XG4gICAgcmV0dXJuIHByZWZpeDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvY29tcGxldGVQcm92aWRlcjtcbiJdfQ==