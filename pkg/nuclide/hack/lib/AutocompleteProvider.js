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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQVcyQixNQUFNOzt5QkFDUCxpQkFBaUI7O29CQUNILFFBQVE7O0FBRWhELElBQU0sZUFBZSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTTtTQUFJLE1BQU0sQ0FBQyxNQUFNO0NBQUEsQ0FBQyxDQUFDLENBQUM7O0lBRXJGLG9CQUFvQjtXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7Ozs7Ozt3QkFBcEIsb0JBQW9COztpQkFFdkIsNEJBQVksaUNBQWlDLENBQUM7NkJBQ2YsV0FDOUIsT0FBaUMsRUFDYTtVQUN2QyxNQUFNLEdBQW9CLE9BQU8sQ0FBakMsTUFBTTtVQUFFLGNBQWMsR0FBSSxPQUFPLENBQXpCLGNBQWM7O0FBQzdCLFVBQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVqRCxVQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLEVBQUU7QUFDOUYsZUFBTyxFQUFFLENBQUM7T0FDWDs7QUFFRCxVQUFNLFdBQVcsR0FBRyxNQUFNLHFDQUEwQixNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzs7QUFFL0UsYUFBTyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQ25DLGVBQU87QUFDTCxpQkFBTyxFQUFFLFVBQVUsQ0FBQyxZQUFZO0FBQ2hDLDJCQUFpQixFQUFqQixpQkFBaUI7QUFDakIsb0JBQVUsRUFBRSxVQUFVLENBQUMsU0FBUztTQUNqQyxDQUFDO09BQ0gsQ0FBQyxDQUFDO0tBQ0o7OztTQXRCRyxvQkFBb0I7OztBQTRCMUIsU0FBUyxTQUFTLENBQ2QsTUFBdUIsRUFDdkIsY0FBMEIsRUFDMUIsYUFBNEIsRUFDNUIsY0FBc0IsRUFDYjtBQUNYLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FDMUMsZ0JBQVUsZ0JBQVUsY0FBYyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsU0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTTtXQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0dBQUEsQ0FBQyxDQUFDO0NBQ2xFOztBQUVELFNBQVMsY0FBYyxDQUFDLE1BQXVCLEVBQVU7QUFDdkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUV0QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsRUFBQyxTQUFTLEVBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQzs7QUFFakYsTUFBTSxLQUFLLEdBQUcsZ0JBQ1YsWUFBWSxDQUFDLEtBQUssRUFDbEIsZ0JBQVUsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEUsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDOztBQUV6RCxNQUFJLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzNDLFdBQU8sTUFBTSxDQUFDO0dBQ2YsTUFBTTtBQUNMLFdBQU8sRUFBRSxDQUFDO0dBQ1g7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6IkF1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtQb2ludCwgUmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7ZmV0Y2hDb21wbGV0aW9uc0ZvckVkaXRvcn0gZnJvbSAnLi9oYWNrJztcblxuY29uc3QgRklFTERfQUNDRVNTT1JTID0gWyctPicsICc6OiddO1xuY29uc3QgUFJFRklYX0xPT0tCQUNLID0gTWF0aC5tYXguYXBwbHkobnVsbCwgRklFTERfQUNDRVNTT1JTLm1hcChwcmVmaXggPT4gcHJlZml4Lmxlbmd0aCkpO1xuXG5jbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLmdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zJylcbiAgYXN5bmMgZ2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMoXG4gICAgcmVxdWVzdDogYXRvbSRBdXRvY29tcGxldGVSZXF1ZXN0LFxuICApOiBQcm9taXNlPD9BcnJheTxhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24+PiB7XG4gICAgY29uc3Qge2VkaXRvciwgYnVmZmVyUG9zaXRpb259ID0gcmVxdWVzdDtcbiAgICBjb25zdCByZXBsYWNlbWVudFByZWZpeCA9IGZpbmRIYWNrUHJlZml4KGVkaXRvcik7XG5cbiAgICBpZiAoIXJlcGxhY2VtZW50UHJlZml4ICYmICFoYXNQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgRklFTERfQUNDRVNTT1JTLCBQUkVGSVhfTE9PS0JBQ0spKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgY29tcGxldGlvbnMgPSBhd2FpdCBmZXRjaENvbXBsZXRpb25zRm9yRWRpdG9yKGVkaXRvciwgcmVwbGFjZW1lbnRQcmVmaXgpO1xuXG4gICAgcmV0dXJuIGNvbXBsZXRpb25zLm1hcChjb21wbGV0aW9uID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNuaXBwZXQ6IGNvbXBsZXRpb24ubWF0Y2hTbmlwcGV0LFxuICAgICAgICByZXBsYWNlbWVudFByZWZpeCxcbiAgICAgICAgcmlnaHRMYWJlbDogY29tcGxldGlvbi5tYXRjaFR5cGUsXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGBidWZmZXJQb3NpdGlvbmAgaXMgcHJlZml4ZWQgd2l0aCBhbnkgb2YgdGhlIHBhc3NlZCBgY2hlY2tQcmVmaXhlc2AuXG4gKi9cbmZ1bmN0aW9uIGhhc1ByZWZpeChcbiAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICBidWZmZXJQb3NpdGlvbjogYXRvbSRQb2ludCxcbiAgICBjaGVja1ByZWZpeGVzOiBBcnJheTxzdHJpbmc+LFxuICAgIHByZWZpeExvb2tiYWNrOiBudW1iZXIsXG4gICk6IGJvb2xlYW4ge1xuICBjb25zdCBwcmlvckNoYXJzID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFxuICAgICAgbmV3IFJhbmdlKG5ldyBQb2ludChidWZmZXJQb3NpdGlvbi5yb3csIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIHByZWZpeExvb2tiYWNrKSwgYnVmZmVyUG9zaXRpb24pKTtcbiAgcmV0dXJuIGNoZWNrUHJlZml4ZXMuc29tZShwcmVmaXggPT4gcHJpb3JDaGFycy5lbmRzV2l0aChwcmVmaXgpKTtcbn1cblxuZnVuY3Rpb24gZmluZEhhY2tQcmVmaXgoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBzdHJpbmcge1xuICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAvLyBXZSB1c2UgY3VzdG9tIHdvcmRSZWdleCB0byBhZG9wdCBwaHAgdmFyaWFibGVzIHN0YXJ0aW5nIHdpdGggJC5cbiAgY29uc3QgY3VycmVudFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uoe3dvcmRSZWdleDovKFxcJFxcdyopfFxcdysvfSk7XG4gIC8vIEN1cnJlbnQgd29yZCBtaWdodCBnbyBiZXlvbmQgdGhlIGN1cnNvciwgc28gd2UgY3V0IGl0LlxuICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgIGN1cnJlbnRSYW5nZS5zdGFydCxcbiAgICAgIG5ldyBQb2ludChjdXJzb3IuZ2V0QnVmZmVyUm93KCksIGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKSkpO1xuICBjb25zdCBwcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpLnRyaW0oKTtcbiAgLy8gUHJlZml4IGNvdWxkIGp1c3QgYmUgJCBvciBlbmRzIHdpdGggc3RyaW5nIGxpdGVyYWwuXG4gIGlmIChwcmVmaXggPT09ICckJyB8fCAhL1tcXFddJC8udGVzdChwcmVmaXgpKSB7XG4gICAgcmV0dXJuIHByZWZpeDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvY29tcGxldGVQcm92aWRlcjtcbiJdfQ==