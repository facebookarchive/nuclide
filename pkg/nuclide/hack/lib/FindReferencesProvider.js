var doFindReferences = _asyncToGenerator(function* (textEditor, position) /*FindReferencesReturn*/{
  var result = yield (0, _atomHelpers.withLoadingNotification)((0, _hack.findReferences)(textEditor, position.row, position.column), 'Loading references from Hack server...');
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

var _hack = require('./hack');

var _hackCommon = require('../../hack-common');

var _analytics = require('../../analytics');

var _atomHelpers = require('../../atom-helpers');

module.exports = {
  isEditorSupported: _asyncToGenerator(function* (textEditor) {
    var fileUri = textEditor.getPath();
    if (!fileUri || !_hackCommon.HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  }),

  findReferences: function findReferences(editor, position) {
    return (0, _analytics.trackOperationTiming)('hack:findReferences', function () {
      return doFindReferences(editor, position);
    });
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBbUJlLGdCQUFnQixxQkFBL0IsV0FDRSxVQUEyQixFQUMzQixRQUFvQiwwQkFDdUI7QUFDM0MsTUFBTSxNQUFNLEdBQUcsTUFBTSwwQ0FDbkIsMEJBQWUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUN6RCx3Q0FBd0MsQ0FDekMsQ0FBQztBQUNGLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxXQUFPLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsK0NBQStDLEVBQUMsQ0FBQztHQUNsRjs7TUFFSSxPQUFPLEdBQTRCLE1BQU0sQ0FBekMsT0FBTztNQUFFLFVBQVUsR0FBZ0IsTUFBTSxDQUFoQyxVQUFVO01BQUUsVUFBVSxHQUFJLE1BQU0sQ0FBcEIsVUFBVTs7O0FBR3BDLFlBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ2pDLFdBQU87QUFDTCxTQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVE7QUFDakIsVUFBSSxFQUFFLElBQUk7QUFDVixXQUFLLEVBQUU7QUFDTCxZQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxjQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVU7T0FDdkI7QUFDRCxTQUFHLEVBQUU7QUFDSCxZQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxjQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVE7T0FDckI7S0FDRixDQUFDO0dBQ0gsQ0FBQyxDQUFDOzs7QUFHSCxNQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDL0IsY0FBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDbEM7O0FBRUQsU0FBTztBQUNMLFFBQUksRUFBRSxNQUFNO0FBQ1osV0FBTyxFQUFQLE9BQU87QUFDUCx3QkFBb0IsRUFBRSxVQUFVO0FBQ2hDLGNBQVUsRUFBVixVQUFVO0dBQ1gsQ0FBQztDQUNIOzs7Ozs7Ozs7Ozs7Ozs7b0JBOUM0QixRQUFROzswQkFDTCxtQkFBbUI7O3lCQUNoQixpQkFBaUI7OzJCQUNkLG9CQUFvQjs7QUE2QzFELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixBQUFNLG1CQUFpQixvQkFBQSxXQUFDLFVBQTJCLEVBQW9CO0FBQ3JFLFFBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsOEJBQWtCLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDekUsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQTs7QUFFRCxnQkFBYyxFQUFBLHdCQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBb0I7QUFDOUUsV0FBTyxxQ0FBcUIscUJBQXFCLEVBQUU7YUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQzlGO0NBQ0YsQ0FBQyIsImZpbGUiOiJGaW5kUmVmZXJlbmNlc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gV2UgY2FuJ3QgcHVsbCBpbiBudWNsaWRlLWZpbmQtcmVmZXJlbmNlcyBhcyBhIGRlcGVuZGVuY3ksIHVuZm9ydHVuYXRlbHkuXG4vLyBpbXBvcnQgdHlwZSB7RmluZFJlZmVyZW5jZXNSZXR1cm59IGZyb20gJ251Y2xpZGUtZmluZC1yZWZlcmVuY2VzJztcblxuaW1wb3J0IHtmaW5kUmVmZXJlbmNlc30gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7SEFDS19HUkFNTUFSU19TRVR9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge3dpdGhMb2FkaW5nTm90aWZpY2F0aW9ufSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5hc3luYyBmdW5jdGlvbiBkb0ZpbmRSZWZlcmVuY2VzKFxuICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuKTogUHJvbWlzZTw/T2JqZWN0IC8qRmluZFJlZmVyZW5jZXNSZXR1cm4qLz4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aXRoTG9hZGluZ05vdGlmaWNhdGlvbihcbiAgICBmaW5kUmVmZXJlbmNlcyh0ZXh0RWRpdG9yLCBwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbiksXG4gICAgJ0xvYWRpbmcgcmVmZXJlbmNlcyBmcm9tIEhhY2sgc2VydmVyLi4uJyxcbiAgKTtcbiAgaWYgKCFyZXN1bHQpIHtcbiAgICByZXR1cm4ge3R5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdPbmx5IGNsYXNzZXMvZnVuY3Rpb25zL21ldGhvZHMgYXJlIHN1cHBvcnRlZC4nfTtcbiAgfVxuXG4gIGxldCB7YmFzZVVyaSwgc3ltYm9sTmFtZSwgcmVmZXJlbmNlc30gPSByZXN1bHQ7XG5cbiAgLy8gUHJvY2VzcyB0aGlzIGludG8gdGhlIGZvcm1hdCBudWNsaWRlLWZpbmQtcmVmZXJlbmNlcyBleHBlY3RzLlxuICByZWZlcmVuY2VzID0gcmVmZXJlbmNlcy5tYXAocmVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdXJpOiByZWYuZmlsZW5hbWUsXG4gICAgICBuYW1lOiBudWxsLCAvLyBUT0RPKGhhbnNvbncpOiBHZXQgdGhlIGNhbGxlciB3aGVuIGl0J3MgYXZhaWxhYmxlXG4gICAgICBzdGFydDoge1xuICAgICAgICBsaW5lOiByZWYubGluZSxcbiAgICAgICAgY29sdW1uOiByZWYuY2hhcl9zdGFydCxcbiAgICAgIH0sXG4gICAgICBlbmQ6IHtcbiAgICAgICAgbGluZTogcmVmLmxpbmUsXG4gICAgICAgIGNvbHVtbjogcmVmLmNoYXJfZW5kLFxuICAgICAgfSxcbiAgICB9O1xuICB9KTtcblxuICAvLyBTdHJpcCBvZmYgdGhlIGdsb2JhbCBuYW1lc3BhY2UgaW5kaWNhdG9yLlxuICBpZiAoc3ltYm9sTmFtZS5zdGFydHNXaXRoKCdcXFxcJykpIHtcbiAgICBzeW1ib2xOYW1lID0gc3ltYm9sTmFtZS5zbGljZSgxKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ2RhdGEnLFxuICAgIGJhc2VVcmksXG4gICAgcmVmZXJlbmNlZFN5bWJvbE5hbWU6IHN5bWJvbE5hbWUsXG4gICAgcmVmZXJlbmNlcyxcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jIGlzRWRpdG9yU3VwcG9ydGVkKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGZpbGVVcmkgPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVVcmkgfHwgIUhBQ0tfR1JBTU1BUlNfU0VULmhhcyh0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGZpbmRSZWZlcmVuY2VzKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZygnaGFjazpmaW5kUmVmZXJlbmNlcycsICgpID0+IGRvRmluZFJlZmVyZW5jZXMoZWRpdG9yLCBwb3NpdGlvbikpO1xuICB9LFxufTtcbiJdfQ==