var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var fetchCompletionsForEditor = _asyncToGenerator(function* (editor, prefix) {
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(editor.getPath());
  var filePath = editor.getPath();
  if (!hackLanguage || !filePath) {
    return [];
  }

  (0, _assert2['default'])(filePath);
  var contents = editor.getText();
  var cursor = editor.getLastCursor();
  var offset = editor.getBuffer().characterIndexForPosition(cursor.getBufferPosition());
  // The returned completions may have unrelated results, even though the offset is set on the end
  // of the prefix.
  var completions = yield hackLanguage.getCompletions(filePath, contents, offset);
  // Filter out the completions that do not contain the prefix as a token in the match text case
  // insentively.
  var tokenLowerCase = prefix.toLowerCase();

  var hackCompletionsCompartor = (0, _utils.compareHackCompletions)(prefix);
  return completions.filter(function (completion) {
    return completion.matchText.toLowerCase().indexOf(tokenLowerCase) >= 0;
  })
  // Sort the auto-completions based on a scoring function considering:
  // case sensitivity, position in the completion, private functions and alphabetical order.
  .sort(function (completion1, completion2) {
    return hackCompletionsCompartor(completion1.matchText, completion2.matchText);
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _HackLanguage = require('./HackLanguage');

var _utils = require('./utils');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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

      var completions = yield fetchCompletionsForEditor(editor, replacementPrefix);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBK0VlLHlCQUF5QixxQkFBeEMsV0FDRSxNQUF1QixFQUN2QixNQUFjLEVBQ087QUFDckIsTUFBTSxZQUFZLEdBQUcsTUFBTSx5Q0FBc0IsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDbkUsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDOUIsV0FBTyxFQUFFLENBQUM7R0FDWDs7QUFFRCwyQkFBVSxRQUFRLENBQUMsQ0FBQztBQUNwQixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3RDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDOzs7QUFHeEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUdsRixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRTVDLE1BQU0sd0JBQXdCLEdBQUcsbUNBQXVCLE1BQU0sQ0FBQyxDQUFDO0FBQ2hFLFNBQU8sV0FBVyxDQUNmLE1BQU0sQ0FBQyxVQUFBLFVBQVU7V0FBSSxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQzs7O0dBR3JGLElBQUksQ0FBQyxVQUFDLFdBQVcsRUFBRSxXQUFXO1dBQzdCLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQztHQUFBLENBQUMsQ0FBQztDQUM3RTs7Ozs7Ozs7Ozs7Ozs7OztvQkFoRzBCLE1BQU07O2dDQUNQLHlCQUF5Qjs7NEJBQ2YsZ0JBQWdCOztxQkFDZixTQUFTOztzQkFDeEIsUUFBUTs7OztBQUU5QixJQUFNLGVBQWUsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU07U0FBSSxNQUFNLENBQUMsTUFBTTtDQUFBLENBQUMsQ0FBQyxDQUFDOztJQUVyRixvQkFBb0I7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7Ozs7Ozs7d0JBQXBCLG9CQUFvQjs7aUJBRXZCLG1DQUFZLGlDQUFpQyxDQUFDOzZCQUNmLFdBQzlCLE9BQWlDLEVBQ2E7VUFDdkMsTUFBTSxHQUFvQixPQUFPLENBQWpDLE1BQU07VUFBRSxjQUFjLEdBQUksT0FBTyxDQUF6QixjQUFjOztBQUM3QixVQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFakQsVUFBSSxDQUFDLGlCQUFpQixJQUNqQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsRUFBRTtBQUN6RSxlQUFPLEVBQUUsQ0FBQztPQUNYOztBQUVELFVBQU0sV0FBVyxHQUFHLE1BQU0seUJBQXlCLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7O0FBRS9FLGFBQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUNuQyxlQUFPO0FBQ0wsaUJBQU8sRUFBRSxVQUFVLENBQUMsWUFBWTtBQUNoQywyQkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLG9CQUFVLEVBQUUsVUFBVSxDQUFDLFNBQVM7U0FDakMsQ0FBQztPQUNILENBQUMsQ0FBQztLQUNKOzs7U0F2Qkcsb0JBQW9COzs7QUE2QjFCLFNBQVMsU0FBUyxDQUNkLE1BQXVCLEVBQ3ZCLGNBQTBCLEVBQzFCLGFBQTRCLEVBQzVCLGNBQXNCLEVBQ2I7QUFDWCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsZ0JBQzdDLGdCQUFVLGNBQWMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsRUFDckUsY0FBYyxDQUNmLENBQUMsQ0FBQztBQUNILFNBQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU07V0FBSSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztHQUFBLENBQUMsQ0FBQztDQUNsRTs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxNQUF1QixFQUFVO0FBQ3ZELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFdEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLEVBQUMsU0FBUyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUM7O0FBRWpGLE1BQU0sS0FBSyxHQUFHLGdCQUNWLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLGdCQUFVLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFekQsTUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQyxXQUFPLE1BQU0sQ0FBQztHQUNmLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7O0FBZ0NELE1BQU0sQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMiLCJmaWxlIjoiQXV0b2NvbXBsZXRlUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1BvaW50LCBSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dldEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuaW1wb3J0IHtjb21wYXJlSGFja0NvbXBsZXRpb25zfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgRklFTERfQUNDRVNTT1JTID0gWyctPicsICc6OiddO1xuY29uc3QgUFJFRklYX0xPT0tCQUNLID0gTWF0aC5tYXguYXBwbHkobnVsbCwgRklFTERfQUNDRVNTT1JTLm1hcChwcmVmaXggPT4gcHJlZml4Lmxlbmd0aCkpO1xuXG5jbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLmdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zJylcbiAgYXN5bmMgZ2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMoXG4gICAgcmVxdWVzdDogYXRvbSRBdXRvY29tcGxldGVSZXF1ZXN0LFxuICApOiBQcm9taXNlPD9BcnJheTxhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24+PiB7XG4gICAgY29uc3Qge2VkaXRvciwgYnVmZmVyUG9zaXRpb259ID0gcmVxdWVzdDtcbiAgICBjb25zdCByZXBsYWNlbWVudFByZWZpeCA9IGZpbmRIYWNrUHJlZml4KGVkaXRvcik7XG5cbiAgICBpZiAoIXJlcGxhY2VtZW50UHJlZml4XG4gICAgICAmJiAhaGFzUHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIEZJRUxEX0FDQ0VTU09SUywgUFJFRklYX0xPT0tCQUNLKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBsZXRpb25zID0gYXdhaXQgZmV0Y2hDb21wbGV0aW9uc0ZvckVkaXRvcihlZGl0b3IsIHJlcGxhY2VtZW50UHJlZml4KTtcblxuICAgIHJldHVybiBjb21wbGV0aW9ucy5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzbmlwcGV0OiBjb21wbGV0aW9uLm1hdGNoU25pcHBldCxcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICAgIHJpZ2h0TGFiZWw6IGNvbXBsZXRpb24ubWF0Y2hUeXBlLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBgYnVmZmVyUG9zaXRpb25gIGlzIHByZWZpeGVkIHdpdGggYW55IG9mIHRoZSBwYXNzZWQgYGNoZWNrUHJlZml4ZXNgLlxuICovXG5mdW5jdGlvbiBoYXNQcmVmaXgoXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgYnVmZmVyUG9zaXRpb246IGF0b20kUG9pbnQsXG4gICAgY2hlY2tQcmVmaXhlczogQXJyYXk8c3RyaW5nPixcbiAgICBwcmVmaXhMb29rYmFjazogbnVtYmVyLFxuICApOiBib29sZWFuIHtcbiAgY29uc3QgcHJpb3JDaGFycyA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShuZXcgUmFuZ2UoXG4gICAgbmV3IFBvaW50KGJ1ZmZlclBvc2l0aW9uLnJvdywgYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gcHJlZml4TG9va2JhY2spLFxuICAgIGJ1ZmZlclBvc2l0aW9uXG4gICkpO1xuICByZXR1cm4gY2hlY2tQcmVmaXhlcy5zb21lKHByZWZpeCA9PiBwcmlvckNoYXJzLmVuZHNXaXRoKHByZWZpeCkpO1xufVxuXG5mdW5jdGlvbiBmaW5kSGFja1ByZWZpeChlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHN0cmluZyB7XG4gIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG4gIC8vIFdlIHVzZSBjdXN0b20gd29yZFJlZ2V4IHRvIGFkb3B0IHBocCB2YXJpYWJsZXMgc3RhcnRpbmcgd2l0aCAkLlxuICBjb25zdCBjdXJyZW50UmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSh7d29yZFJlZ2V4Oi8oXFwkXFx3Kil8XFx3Ky99KTtcbiAgLy8gQ3VycmVudCB3b3JkIG1pZ2h0IGdvIGJleW9uZCB0aGUgY3Vyc29yLCBzbyB3ZSBjdXQgaXQuXG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgY3VycmVudFJhbmdlLnN0YXJ0LFxuICAgICAgbmV3IFBvaW50KGN1cnNvci5nZXRCdWZmZXJSb3coKSwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpKSk7XG4gIGNvbnN0IHByZWZpeCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkudHJpbSgpO1xuICAvLyBQcmVmaXggY291bGQganVzdCBiZSAkIG9yIGVuZHMgd2l0aCBzdHJpbmcgbGl0ZXJhbC5cbiAgaWYgKHByZWZpeCA9PT0gJyQnIHx8ICEvW1xcV10kLy50ZXN0KHByZWZpeCkpIHtcbiAgICByZXR1cm4gcHJlZml4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBmZXRjaENvbXBsZXRpb25zRm9yRWRpdG9yKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgcHJlZml4OiBzdHJpbmdcbik6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkoZWRpdG9yLmdldFBhdGgoKSk7XG4gIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgaWYgKCFoYWNrTGFuZ3VhZ2UgfHwgIWZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgaW52YXJpYW50KGZpbGVQYXRoKTtcbiAgY29uc3QgY29udGVudHMgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICBjb25zdCBvZmZzZXQgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuY2hhcmFjdGVySW5kZXhGb3JQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSk7XG4gIC8vIFRoZSByZXR1cm5lZCBjb21wbGV0aW9ucyBtYXkgaGF2ZSB1bnJlbGF0ZWQgcmVzdWx0cywgZXZlbiB0aG91Z2ggdGhlIG9mZnNldCBpcyBzZXQgb24gdGhlIGVuZFxuICAvLyBvZiB0aGUgcHJlZml4LlxuICBjb25zdCBjb21wbGV0aW9ucyA9IGF3YWl0IGhhY2tMYW5ndWFnZS5nZXRDb21wbGV0aW9ucyhmaWxlUGF0aCwgY29udGVudHMsIG9mZnNldCk7XG4gIC8vIEZpbHRlciBvdXQgdGhlIGNvbXBsZXRpb25zIHRoYXQgZG8gbm90IGNvbnRhaW4gdGhlIHByZWZpeCBhcyBhIHRva2VuIGluIHRoZSBtYXRjaCB0ZXh0IGNhc2VcbiAgLy8gaW5zZW50aXZlbHkuXG4gIGNvbnN0IHRva2VuTG93ZXJDYXNlID0gcHJlZml4LnRvTG93ZXJDYXNlKCk7XG5cbiAgY29uc3QgaGFja0NvbXBsZXRpb25zQ29tcGFydG9yID0gY29tcGFyZUhhY2tDb21wbGV0aW9ucyhwcmVmaXgpO1xuICByZXR1cm4gY29tcGxldGlvbnNcbiAgICAuZmlsdGVyKGNvbXBsZXRpb24gPT4gY29tcGxldGlvbi5tYXRjaFRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRva2VuTG93ZXJDYXNlKSA+PSAwKVxuICAgIC8vIFNvcnQgdGhlIGF1dG8tY29tcGxldGlvbnMgYmFzZWQgb24gYSBzY29yaW5nIGZ1bmN0aW9uIGNvbnNpZGVyaW5nOlxuICAgIC8vIGNhc2Ugc2Vuc2l0aXZpdHksIHBvc2l0aW9uIGluIHRoZSBjb21wbGV0aW9uLCBwcml2YXRlIGZ1bmN0aW9ucyBhbmQgYWxwaGFiZXRpY2FsIG9yZGVyLlxuICAgIC5zb3J0KChjb21wbGV0aW9uMSwgY29tcGxldGlvbjIpID0+XG4gICAgICBoYWNrQ29tcGxldGlvbnNDb21wYXJ0b3IoY29tcGxldGlvbjEubWF0Y2hUZXh0LCBjb21wbGV0aW9uMi5tYXRjaFRleHQpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvY29tcGxldGVQcm92aWRlcjtcbiJdfQ==