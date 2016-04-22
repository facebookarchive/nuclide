var doFindReferences = _asyncToGenerator(function* (textEditor, position) /*FindReferencesReturn*/{
  var result = yield (0, _nuclideAtomHelpers.withLoadingNotification)(findReferences(textEditor, position.row, position.column), 'Loading references from Hack server...');
  if (!result) {
    return { type: 'error', message: 'Only classes/functions/methods are supported.' };
  }

  var baseUri = result.baseUri;
  var symbolName = result.symbolName;
  var references = result.references;

  // Process this into the format nuclide-find-references expects.
  references = references.map(function (ref) {
    return {
      uri: ref.filename,
      name: null, // TODO(hansonw): Get the caller when it's available
      start: {
        line: ref.line,
        column: ref.char_start
      },
      end: {
        line: ref.line,
        column: ref.char_end
      }
    };
  });

  // Strip off the global namespace indicator.
  if (symbolName.startsWith('\\')) {
    symbolName = symbolName.slice(1);
  }

  return {
    type: 'data',
    baseUri: baseUri,
    referencedSymbolName: symbolName,
    references: references
  };
});

var findReferences = _asyncToGenerator(function* (editor, line, column) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (!hackLanguage || !filePath) {
    return null;
  }

  var contents = editor.getText();
  return yield hackLanguage.findReferences(filePath, contents, line, column);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// We can't pull in nuclide-find-references as a dependency, unfortunately.
// import type {FindReferencesReturn} from 'nuclide-find-references';

var _nuclideHackCommon = require('../../nuclide-hack-common');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _HackLanguage = require('./HackLanguage');

module.exports = {
  isEditorSupported: _asyncToGenerator(function* (textEditor) {
    var fileUri = textEditor.getPath();
    if (!fileUri || !_nuclideHackCommon.HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  }),

  findReferences: function findReferences(editor, position) {
    return (0, _nuclideAnalytics.trackOperationTiming)('hack:findReferences', function () {
      return doFindReferences(editor, position);
    });
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBdUJlLGdCQUFnQixxQkFBL0IsV0FDRSxVQUEyQixFQUMzQixRQUFvQiwwQkFDdUI7QUFDM0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxpREFDbkIsY0FBYyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFDekQsd0NBQXdDLENBQ3pDLENBQUM7QUFDRixNQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsV0FBTyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLCtDQUErQyxFQUFDLENBQUM7R0FDbEY7O01BRU0sT0FBTyxHQUFJLE1BQU0sQ0FBakIsT0FBTztNQUNULFVBQVUsR0FBZ0IsTUFBTSxDQUFoQyxVQUFVO01BQUUsVUFBVSxHQUFJLE1BQU0sQ0FBcEIsVUFBVTs7O0FBRzNCLFlBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ2pDLFdBQU87QUFDTCxTQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVE7QUFDakIsVUFBSSxFQUFFLElBQUk7QUFDVixXQUFLLEVBQUU7QUFDTCxZQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxjQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVU7T0FDdkI7QUFDRCxTQUFHLEVBQUU7QUFDSCxZQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxjQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVE7T0FDckI7S0FDRixDQUFDO0dBQ0gsQ0FBQyxDQUFDOzs7QUFHSCxNQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDL0IsY0FBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDbEM7O0FBRUQsU0FBTztBQUNMLFFBQUksRUFBRSxNQUFNO0FBQ1osV0FBTyxFQUFQLE9BQU87QUFDUCx3QkFBb0IsRUFBRSxVQUFVO0FBQ2hDLGNBQVUsRUFBVixVQUFVO0dBQ1gsQ0FBQztDQUNIOztJQUVjLGNBQWMscUJBQTdCLFdBQ0UsTUFBdUIsRUFDdkIsSUFBWSxFQUNaLE1BQWMsRUFDcUU7QUFDbkYsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0seUNBQXNCLFFBQVEsQ0FBQyxDQUFDO0FBQzNELE1BQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDOUIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsU0FBTyxNQUFNLFlBQVksQ0FBQyxjQUFjLENBQ3RDLFFBQVEsRUFDUixRQUFRLEVBQ1IsSUFBSSxFQUNKLE1BQU0sQ0FDUCxDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7OztpQ0FuRStCLDJCQUEyQjs7Z0NBQ3hCLHlCQUF5Qjs7a0NBQ3RCLDRCQUE0Qjs7NEJBQzlCLGdCQUFnQjs7QUFrRXBELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixBQUFNLG1CQUFpQixvQkFBQSxXQUFDLFVBQTJCLEVBQW9CO0FBQ3JFLFFBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUMsT0FBTyxJQUFJLENBQUMscUNBQWtCLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDekUsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQTs7QUFFRCxnQkFBYyxFQUFBLHdCQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBb0I7QUFDOUUsV0FBTyw0Q0FBcUIscUJBQXFCLEVBQUU7YUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQzlGO0NBQ0YsQ0FBQyIsImZpbGUiOiJGaW5kUmVmZXJlbmNlc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gV2UgY2FuJ3QgcHVsbCBpbiBudWNsaWRlLWZpbmQtcmVmZXJlbmNlcyBhcyBhIGRlcGVuZGVuY3ksIHVuZm9ydHVuYXRlbHkuXG4vLyBpbXBvcnQgdHlwZSB7RmluZFJlZmVyZW5jZXNSZXR1cm59IGZyb20gJ251Y2xpZGUtZmluZC1yZWZlcmVuY2VzJztcblxuaW1wb3J0IHR5cGUge1xuICBIYWNrUmVmZXJlbmNlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuXG5pbXBvcnQge0hBQ0tfR1JBTU1BUlNfU0VUfSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stY29tbW9uJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7d2l0aExvYWRpbmdOb3RpZmljYXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0SGFja0xhbmd1YWdlRm9yVXJpfSBmcm9tICcuL0hhY2tMYW5ndWFnZSc7XG5cbmFzeW5jIGZ1bmN0aW9uIGRvRmluZFJlZmVyZW5jZXMoXG4gIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4pOiBQcm9taXNlPD9PYmplY3QgLypGaW5kUmVmZXJlbmNlc1JldHVybiovPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpdGhMb2FkaW5nTm90aWZpY2F0aW9uKFxuICAgIGZpbmRSZWZlcmVuY2VzKHRleHRFZGl0b3IsIHBvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uKSxcbiAgICAnTG9hZGluZyByZWZlcmVuY2VzIGZyb20gSGFjayBzZXJ2ZXIuLi4nLFxuICApO1xuICBpZiAoIXJlc3VsdCkge1xuICAgIHJldHVybiB7dHlwZTogJ2Vycm9yJywgbWVzc2FnZTogJ09ubHkgY2xhc3Nlcy9mdW5jdGlvbnMvbWV0aG9kcyBhcmUgc3VwcG9ydGVkLid9O1xuICB9XG5cbiAgY29uc3Qge2Jhc2VVcml9ID0gcmVzdWx0O1xuICBsZXQge3N5bWJvbE5hbWUsIHJlZmVyZW5jZXN9ID0gcmVzdWx0O1xuXG4gIC8vIFByb2Nlc3MgdGhpcyBpbnRvIHRoZSBmb3JtYXQgbnVjbGlkZS1maW5kLXJlZmVyZW5jZXMgZXhwZWN0cy5cbiAgcmVmZXJlbmNlcyA9IHJlZmVyZW5jZXMubWFwKHJlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVyaTogcmVmLmZpbGVuYW1lLFxuICAgICAgbmFtZTogbnVsbCwgLy8gVE9ETyhoYW5zb253KTogR2V0IHRoZSBjYWxsZXIgd2hlbiBpdCdzIGF2YWlsYWJsZVxuICAgICAgc3RhcnQ6IHtcbiAgICAgICAgbGluZTogcmVmLmxpbmUsXG4gICAgICAgIGNvbHVtbjogcmVmLmNoYXJfc3RhcnQsXG4gICAgICB9LFxuICAgICAgZW5kOiB7XG4gICAgICAgIGxpbmU6IHJlZi5saW5lLFxuICAgICAgICBjb2x1bW46IHJlZi5jaGFyX2VuZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gU3RyaXAgb2ZmIHRoZSBnbG9iYWwgbmFtZXNwYWNlIGluZGljYXRvci5cbiAgaWYgKHN5bWJvbE5hbWUuc3RhcnRzV2l0aCgnXFxcXCcpKSB7XG4gICAgc3ltYm9sTmFtZSA9IHN5bWJvbE5hbWUuc2xpY2UoMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdkYXRhJyxcbiAgICBiYXNlVXJpLFxuICAgIHJlZmVyZW5jZWRTeW1ib2xOYW1lOiBzeW1ib2xOYW1lLFxuICAgIHJlZmVyZW5jZXMsXG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRSZWZlcmVuY2VzKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgbGluZTogbnVtYmVyLFxuICBjb2x1bW46IG51bWJlclxuKTogUHJvbWlzZTw/e2Jhc2VVcmk6IHN0cmluZzsgc3ltYm9sTmFtZTogc3RyaW5nOyByZWZlcmVuY2VzOiBBcnJheTxIYWNrUmVmZXJlbmNlPn0+IHtcbiAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkoZmlsZVBhdGgpO1xuICBpZiAoIWhhY2tMYW5ndWFnZSB8fCAhZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRzID0gZWRpdG9yLmdldFRleHQoKTtcbiAgcmV0dXJuIGF3YWl0IGhhY2tMYW5ndWFnZS5maW5kUmVmZXJlbmNlcyhcbiAgICBmaWxlUGF0aCxcbiAgICBjb250ZW50cyxcbiAgICBsaW5lLFxuICAgIGNvbHVtbixcbiAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jIGlzRWRpdG9yU3VwcG9ydGVkKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGZpbGVVcmkgPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVVcmkgfHwgIUhBQ0tfR1JBTU1BUlNfU0VULmhhcyh0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGZpbmRSZWZlcmVuY2VzKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZygnaGFjazpmaW5kUmVmZXJlbmNlcycsICgpID0+IGRvRmluZFJlZmVyZW5jZXMoZWRpdG9yLCBwb3NpdGlvbikpO1xuICB9LFxufTtcbiJdfQ==