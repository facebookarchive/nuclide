var doFindReferences = _asyncToGenerator(function* (textEditor, position) /*FindReferencesReturn*/{
  var result = yield (0, _nuclideAtomHelpers.withLoadingNotification)((0, _hack.findReferences)(textEditor, position.row, position.column), 'Loading references from Hack server...');
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

var _nuclideHackCommon = require('../../nuclide-hack-common');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBbUJlLGdCQUFnQixxQkFBL0IsV0FDRSxVQUEyQixFQUMzQixRQUFvQiwwQkFDdUI7QUFDM0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxpREFDbkIsMEJBQWUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUN6RCx3Q0FBd0MsQ0FDekMsQ0FBQztBQUNGLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxXQUFPLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsK0NBQStDLEVBQUMsQ0FBQztHQUNsRjs7TUFFTSxPQUFPLEdBQUksTUFBTSxDQUFqQixPQUFPO01BQ1QsVUFBVSxHQUFnQixNQUFNLENBQWhDLFVBQVU7TUFBRSxVQUFVLEdBQUksTUFBTSxDQUFwQixVQUFVOzs7QUFHM0IsWUFBVSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDakMsV0FBTztBQUNMLFNBQUcsRUFBRSxHQUFHLENBQUMsUUFBUTtBQUNqQixVQUFJLEVBQUUsSUFBSTtBQUNWLFdBQUssRUFBRTtBQUNMLFlBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtBQUNkLGNBQU0sRUFBRSxHQUFHLENBQUMsVUFBVTtPQUN2QjtBQUNELFNBQUcsRUFBRTtBQUNILFlBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtBQUNkLGNBQU0sRUFBRSxHQUFHLENBQUMsUUFBUTtPQUNyQjtLQUNGLENBQUM7R0FDSCxDQUFDLENBQUM7OztBQUdILE1BQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMvQixjQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNsQzs7QUFFRCxTQUFPO0FBQ0wsUUFBSSxFQUFFLE1BQU07QUFDWixXQUFPLEVBQVAsT0FBTztBQUNQLHdCQUFvQixFQUFFLFVBQVU7QUFDaEMsY0FBVSxFQUFWLFVBQVU7R0FDWCxDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7OztvQkEvQzRCLFFBQVE7O2lDQUNMLDJCQUEyQjs7Z0NBQ3hCLHlCQUF5Qjs7a0NBQ3RCLDRCQUE0Qjs7QUE4Q2xFLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixBQUFNLG1CQUFpQixvQkFBQSxXQUFDLFVBQTJCLEVBQW9CO0FBQ3JFLFFBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUMsT0FBTyxJQUFJLENBQUMscUNBQWtCLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDekUsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQTs7QUFFRCxnQkFBYyxFQUFBLHdCQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBb0I7QUFDOUUsV0FBTyw0Q0FBcUIscUJBQXFCLEVBQUU7YUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQzlGO0NBQ0YsQ0FBQyIsImZpbGUiOiJGaW5kUmVmZXJlbmNlc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gV2UgY2FuJ3QgcHVsbCBpbiBudWNsaWRlLWZpbmQtcmVmZXJlbmNlcyBhcyBhIGRlcGVuZGVuY3ksIHVuZm9ydHVuYXRlbHkuXG4vLyBpbXBvcnQgdHlwZSB7RmluZFJlZmVyZW5jZXNSZXR1cm59IGZyb20gJ251Y2xpZGUtZmluZC1yZWZlcmVuY2VzJztcblxuaW1wb3J0IHtmaW5kUmVmZXJlbmNlc30gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7SEFDS19HUkFNTUFSU19TRVR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHt0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHt3aXRoTG9hZGluZ05vdGlmaWNhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuXG5hc3luYyBmdW5jdGlvbiBkb0ZpbmRSZWZlcmVuY2VzKFxuICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuKTogUHJvbWlzZTw/T2JqZWN0IC8qRmluZFJlZmVyZW5jZXNSZXR1cm4qLz4ge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aXRoTG9hZGluZ05vdGlmaWNhdGlvbihcbiAgICBmaW5kUmVmZXJlbmNlcyh0ZXh0RWRpdG9yLCBwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbiksXG4gICAgJ0xvYWRpbmcgcmVmZXJlbmNlcyBmcm9tIEhhY2sgc2VydmVyLi4uJyxcbiAgKTtcbiAgaWYgKCFyZXN1bHQpIHtcbiAgICByZXR1cm4ge3R5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdPbmx5IGNsYXNzZXMvZnVuY3Rpb25zL21ldGhvZHMgYXJlIHN1cHBvcnRlZC4nfTtcbiAgfVxuXG4gIGNvbnN0IHtiYXNlVXJpfSA9IHJlc3VsdDtcbiAgbGV0IHtzeW1ib2xOYW1lLCByZWZlcmVuY2VzfSA9IHJlc3VsdDtcblxuICAvLyBQcm9jZXNzIHRoaXMgaW50byB0aGUgZm9ybWF0IG51Y2xpZGUtZmluZC1yZWZlcmVuY2VzIGV4cGVjdHMuXG4gIHJlZmVyZW5jZXMgPSByZWZlcmVuY2VzLm1hcChyZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB1cmk6IHJlZi5maWxlbmFtZSxcbiAgICAgIG5hbWU6IG51bGwsIC8vIFRPRE8oaGFuc29udyk6IEdldCB0aGUgY2FsbGVyIHdoZW4gaXQncyBhdmFpbGFibGVcbiAgICAgIHN0YXJ0OiB7XG4gICAgICAgIGxpbmU6IHJlZi5saW5lLFxuICAgICAgICBjb2x1bW46IHJlZi5jaGFyX3N0YXJ0LFxuICAgICAgfSxcbiAgICAgIGVuZDoge1xuICAgICAgICBsaW5lOiByZWYubGluZSxcbiAgICAgICAgY29sdW1uOiByZWYuY2hhcl9lbmQsXG4gICAgICB9LFxuICAgIH07XG4gIH0pO1xuXG4gIC8vIFN0cmlwIG9mZiB0aGUgZ2xvYmFsIG5hbWVzcGFjZSBpbmRpY2F0b3IuXG4gIGlmIChzeW1ib2xOYW1lLnN0YXJ0c1dpdGgoJ1xcXFwnKSkge1xuICAgIHN5bWJvbE5hbWUgPSBzeW1ib2xOYW1lLnNsaWNlKDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnZGF0YScsXG4gICAgYmFzZVVyaSxcbiAgICByZWZlcmVuY2VkU3ltYm9sTmFtZTogc3ltYm9sTmFtZSxcbiAgICByZWZlcmVuY2VzLFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXN5bmMgaXNFZGl0b3JTdXBwb3J0ZWQodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZmlsZVVyaSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVVyaSB8fCAhSEFDS19HUkFNTUFSU19TRVQuaGFzKHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZmluZFJlZmVyZW5jZXMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRyYWNrT3BlcmF0aW9uVGltaW5nKCdoYWNrOmZpbmRSZWZlcmVuY2VzJywgKCkgPT4gZG9GaW5kUmVmZXJlbmNlcyhlZGl0b3IsIHBvc2l0aW9uKSk7XG4gIH0sXG59O1xuIl19