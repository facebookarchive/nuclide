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

var _nuclideAnalytics = require('../../nuclide-analytics');

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
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.getAutocompleteSuggestions')],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQVcyQixNQUFNOztnQ0FDUCx5QkFBeUI7O29CQUNYLFFBQVE7O0FBRWhELElBQU0sZUFBZSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTTtTQUFJLE1BQU0sQ0FBQyxNQUFNO0NBQUEsQ0FBQyxDQUFDLENBQUM7O0lBRXJGLG9CQUFvQjtXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7Ozs7Ozt3QkFBcEIsb0JBQW9COztpQkFFdkIsbUNBQVksaUNBQWlDLENBQUM7NkJBQ2YsV0FDOUIsT0FBaUMsRUFDYTtVQUN2QyxNQUFNLEdBQW9CLE9BQU8sQ0FBakMsTUFBTTtVQUFFLGNBQWMsR0FBSSxPQUFPLENBQXpCLGNBQWM7O0FBQzdCLFVBQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVqRCxVQUFJLENBQUMsaUJBQWlCLElBQ2pCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxFQUFFO0FBQ3pFLGVBQU8sRUFBRSxDQUFDO09BQ1g7O0FBRUQsVUFBTSxXQUFXLEdBQUcsTUFBTSxxQ0FBMEIsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7O0FBRS9FLGFBQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUNuQyxlQUFPO0FBQ0wsaUJBQU8sRUFBRSxVQUFVLENBQUMsWUFBWTtBQUNoQywyQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG9CQUFVLEVBQUUsVUFBVSxDQUFDLFNBQVM7U0FDakMsQ0FBQztPQUNILENBQUMsQ0FBQztLQUNKOzs7U0F2Qkcsb0JBQW9COzs7QUE2QjFCLFNBQVMsU0FBUyxDQUNkLE1BQXVCLEVBQ3ZCLGNBQTBCLEVBQzFCLGFBQTRCLEVBQzVCLGNBQXNCLEVBQ2I7QUFDWCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsZ0JBQzdDLGdCQUFVLGNBQWMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsRUFDckUsY0FBYyxDQUNmLENBQUMsQ0FBQztBQUNILFNBQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU07V0FBSSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztHQUFBLENBQUMsQ0FBQztDQUNsRTs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxNQUF1QixFQUFVO0FBQ3ZELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFdEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLEVBQUMsU0FBUyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUM7O0FBRWpGLE1BQU0sS0FBSyxHQUFHLGdCQUNWLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLGdCQUFVLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFekQsTUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQyxXQUFPLE1BQU0sQ0FBQztHQUNmLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyIsImZpbGUiOiJBdXRvY29tcGxldGVQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UG9pbnQsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7ZmV0Y2hDb21wbGV0aW9uc0ZvckVkaXRvcn0gZnJvbSAnLi9oYWNrJztcblxuY29uc3QgRklFTERfQUNDRVNTT1JTID0gWyctPicsICc6OiddO1xuY29uc3QgUFJFRklYX0xPT0tCQUNLID0gTWF0aC5tYXguYXBwbHkobnVsbCwgRklFTERfQUNDRVNTT1JTLm1hcChwcmVmaXggPT4gcHJlZml4Lmxlbmd0aCkpO1xuXG5jbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLmdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zJylcbiAgYXN5bmMgZ2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMoXG4gICAgcmVxdWVzdDogYXRvbSRBdXRvY29tcGxldGVSZXF1ZXN0LFxuICApOiBQcm9taXNlPD9BcnJheTxhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24+PiB7XG4gICAgY29uc3Qge2VkaXRvciwgYnVmZmVyUG9zaXRpb259ID0gcmVxdWVzdDtcbiAgICBjb25zdCByZXBsYWNlbWVudFByZWZpeCA9IGZpbmRIYWNrUHJlZml4KGVkaXRvcik7XG5cbiAgICBpZiAoIXJlcGxhY2VtZW50UHJlZml4XG4gICAgICAmJiAhaGFzUHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIEZJRUxEX0FDQ0VTU09SUywgUFJFRklYX0xPT0tCQUNLKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBsZXRpb25zID0gYXdhaXQgZmV0Y2hDb21wbGV0aW9uc0ZvckVkaXRvcihlZGl0b3IsIHJlcGxhY2VtZW50UHJlZml4KTtcblxuICAgIHJldHVybiBjb21wbGV0aW9ucy5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzbmlwcGV0OiBjb21wbGV0aW9uLm1hdGNoU25pcHBldCxcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICAgIHJpZ2h0TGFiZWw6IGNvbXBsZXRpb24ubWF0Y2hUeXBlLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBgYnVmZmVyUG9zaXRpb25gIGlzIHByZWZpeGVkIHdpdGggYW55IG9mIHRoZSBwYXNzZWQgYGNoZWNrUHJlZml4ZXNgLlxuICovXG5mdW5jdGlvbiBoYXNQcmVmaXgoXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgYnVmZmVyUG9zaXRpb246IGF0b20kUG9pbnQsXG4gICAgY2hlY2tQcmVmaXhlczogQXJyYXk8c3RyaW5nPixcbiAgICBwcmVmaXhMb29rYmFjazogbnVtYmVyLFxuICApOiBib29sZWFuIHtcbiAgY29uc3QgcHJpb3JDaGFycyA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShuZXcgUmFuZ2UoXG4gICAgbmV3IFBvaW50KGJ1ZmZlclBvc2l0aW9uLnJvdywgYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gcHJlZml4TG9va2JhY2spLFxuICAgIGJ1ZmZlclBvc2l0aW9uXG4gICkpO1xuICByZXR1cm4gY2hlY2tQcmVmaXhlcy5zb21lKHByZWZpeCA9PiBwcmlvckNoYXJzLmVuZHNXaXRoKHByZWZpeCkpO1xufVxuXG5mdW5jdGlvbiBmaW5kSGFja1ByZWZpeChlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHN0cmluZyB7XG4gIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG4gIC8vIFdlIHVzZSBjdXN0b20gd29yZFJlZ2V4IHRvIGFkb3B0IHBocCB2YXJpYWJsZXMgc3RhcnRpbmcgd2l0aCAkLlxuICBjb25zdCBjdXJyZW50UmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSh7d29yZFJlZ2V4Oi8oXFwkXFx3Kil8XFx3Ky99KTtcbiAgLy8gQ3VycmVudCB3b3JkIG1pZ2h0IGdvIGJleW9uZCB0aGUgY3Vyc29yLCBzbyB3ZSBjdXQgaXQuXG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgY3VycmVudFJhbmdlLnN0YXJ0LFxuICAgICAgbmV3IFBvaW50KGN1cnNvci5nZXRCdWZmZXJSb3coKSwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpKSk7XG4gIGNvbnN0IHByZWZpeCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkudHJpbSgpO1xuICAvLyBQcmVmaXggY291bGQganVzdCBiZSAkIG9yIGVuZHMgd2l0aCBzdHJpbmcgbGl0ZXJhbC5cbiAgaWYgKHByZWZpeCA9PT0gJyQnIHx8ICEvW1xcV10kLy50ZXN0KHByZWZpeCkpIHtcbiAgICByZXR1cm4gcHJlZml4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9jb21wbGV0ZVByb3ZpZGVyO1xuIl19