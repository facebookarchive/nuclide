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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBbUJlLGdCQUFnQixxQkFBL0IsV0FDRSxVQUEyQixFQUMzQixRQUFvQiwwQkFDdUI7QUFDM0MsTUFBTSxNQUFNLEdBQUcsTUFBTSwwQ0FDbkIsMEJBQWUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUN6RCx3Q0FBd0MsQ0FDekMsQ0FBQztBQUNGLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxXQUFPLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsK0NBQStDLEVBQUMsQ0FBQztHQUNsRjs7TUFFTSxPQUFPLEdBQUksTUFBTSxDQUFqQixPQUFPO01BQ1QsVUFBVSxHQUFnQixNQUFNLENBQWhDLFVBQVU7TUFBRSxVQUFVLEdBQUksTUFBTSxDQUFwQixVQUFVOzs7QUFHM0IsWUFBVSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDakMsV0FBTztBQUNMLFNBQUcsRUFBRSxHQUFHLENBQUMsUUFBUTtBQUNqQixVQUFJLEVBQUUsSUFBSTtBQUNWLFdBQUssRUFBRTtBQUNMLFlBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtBQUNkLGNBQU0sRUFBRSxHQUFHLENBQUMsVUFBVTtPQUN2QjtBQUNELFNBQUcsRUFBRTtBQUNILFlBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtBQUNkLGNBQU0sRUFBRSxHQUFHLENBQUMsUUFBUTtPQUNyQjtLQUNGLENBQUM7R0FDSCxDQUFDLENBQUM7OztBQUdILE1BQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMvQixjQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNsQzs7QUFFRCxTQUFPO0FBQ0wsUUFBSSxFQUFFLE1BQU07QUFDWixXQUFPLEVBQVAsT0FBTztBQUNQLHdCQUFvQixFQUFFLFVBQVU7QUFDaEMsY0FBVSxFQUFWLFVBQVU7R0FDWCxDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7OztvQkEvQzRCLFFBQVE7OzBCQUNMLG1CQUFtQjs7eUJBQ2hCLGlCQUFpQjs7MkJBQ2Qsb0JBQW9COztBQThDMUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLEFBQU0sbUJBQWlCLG9CQUFBLFdBQUMsVUFBMkIsRUFBb0I7QUFDckUsUUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyw4QkFBa0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUN6RSxhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYixDQUFBOztBQUVELGdCQUFjLEVBQUEsd0JBQUMsTUFBdUIsRUFBRSxRQUFvQixFQUFvQjtBQUM5RSxXQUFPLHFDQUFxQixxQkFBcUIsRUFBRTthQUFNLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDOUY7Q0FDRixDQUFDIiwiZmlsZSI6IkZpbmRSZWZlcmVuY2VzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyBXZSBjYW4ndCBwdWxsIGluIG51Y2xpZGUtZmluZC1yZWZlcmVuY2VzIGFzIGEgZGVwZW5kZW5jeSwgdW5mb3J0dW5hdGVseS5cbi8vIGltcG9ydCB0eXBlIHtGaW5kUmVmZXJlbmNlc1JldHVybn0gZnJvbSAnbnVjbGlkZS1maW5kLXJlZmVyZW5jZXMnO1xuXG5pbXBvcnQge2ZpbmRSZWZlcmVuY2VzfSBmcm9tICcuL2hhY2snO1xuaW1wb3J0IHtIQUNLX0dSQU1NQVJTX1NFVH0gZnJvbSAnLi4vLi4vaGFjay1jb21tb24nO1xuaW1wb3J0IHt0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7d2l0aExvYWRpbmdOb3RpZmljYXRpb259IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5cbmFzeW5jIGZ1bmN0aW9uIGRvRmluZFJlZmVyZW5jZXMoXG4gIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4pOiBQcm9taXNlPD9PYmplY3QgLypGaW5kUmVmZXJlbmNlc1JldHVybiovPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpdGhMb2FkaW5nTm90aWZpY2F0aW9uKFxuICAgIGZpbmRSZWZlcmVuY2VzKHRleHRFZGl0b3IsIHBvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uKSxcbiAgICAnTG9hZGluZyByZWZlcmVuY2VzIGZyb20gSGFjayBzZXJ2ZXIuLi4nLFxuICApO1xuICBpZiAoIXJlc3VsdCkge1xuICAgIHJldHVybiB7dHlwZTogJ2Vycm9yJywgbWVzc2FnZTogJ09ubHkgY2xhc3Nlcy9mdW5jdGlvbnMvbWV0aG9kcyBhcmUgc3VwcG9ydGVkLid9O1xuICB9XG5cbiAgY29uc3Qge2Jhc2VVcml9ID0gcmVzdWx0O1xuICBsZXQge3N5bWJvbE5hbWUsIHJlZmVyZW5jZXN9ID0gcmVzdWx0O1xuXG4gIC8vIFByb2Nlc3MgdGhpcyBpbnRvIHRoZSBmb3JtYXQgbnVjbGlkZS1maW5kLXJlZmVyZW5jZXMgZXhwZWN0cy5cbiAgcmVmZXJlbmNlcyA9IHJlZmVyZW5jZXMubWFwKHJlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVyaTogcmVmLmZpbGVuYW1lLFxuICAgICAgbmFtZTogbnVsbCwgLy8gVE9ETyhoYW5zb253KTogR2V0IHRoZSBjYWxsZXIgd2hlbiBpdCdzIGF2YWlsYWJsZVxuICAgICAgc3RhcnQ6IHtcbiAgICAgICAgbGluZTogcmVmLmxpbmUsXG4gICAgICAgIGNvbHVtbjogcmVmLmNoYXJfc3RhcnQsXG4gICAgICB9LFxuICAgICAgZW5kOiB7XG4gICAgICAgIGxpbmU6IHJlZi5saW5lLFxuICAgICAgICBjb2x1bW46IHJlZi5jaGFyX2VuZCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gU3RyaXAgb2ZmIHRoZSBnbG9iYWwgbmFtZXNwYWNlIGluZGljYXRvci5cbiAgaWYgKHN5bWJvbE5hbWUuc3RhcnRzV2l0aCgnXFxcXCcpKSB7XG4gICAgc3ltYm9sTmFtZSA9IHN5bWJvbE5hbWUuc2xpY2UoMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdkYXRhJyxcbiAgICBiYXNlVXJpLFxuICAgIHJlZmVyZW5jZWRTeW1ib2xOYW1lOiBzeW1ib2xOYW1lLFxuICAgIHJlZmVyZW5jZXMsXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3luYyBpc0VkaXRvclN1cHBvcnRlZCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBmaWxlVXJpID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlVXJpIHx8ICFIQUNLX0dSQU1NQVJTX1NFVC5oYXModGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBmaW5kUmVmZXJlbmNlcyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgICByZXR1cm4gdHJhY2tPcGVyYXRpb25UaW1pbmcoJ2hhY2s6ZmluZFJlZmVyZW5jZXMnLCAoKSA9PiBkb0ZpbmRSZWZlcmVuY2VzKGVkaXRvciwgcG9zaXRpb24pKTtcbiAgfSxcbn07XG4iXX0=