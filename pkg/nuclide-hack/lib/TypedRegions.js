Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.convertTypedRegionsToCoverageRegions = convertTypedRegionsToCoverageRegions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

// A region of untyped code.
// Currently may not span multiple lines. Consider enabling multi-line regions.
//
// start/end are column indices.
// Line/start/end are 1 based.
// end is inclusive.

function convertTypedRegionsToCoverageRegions(regions) {
  if (regions == null) {
    return [];
  }

  var startColumn = 1;
  var line = 1;
  var column = startColumn;
  var results = [];
  regions.forEach(function (region) {
    var type = region.color;
    var isMessage = type === 'unchecked' || type === 'partial';

    function addMessage(width) {
      if (isMessage && width > 0) {
        var _last = results[results.length - 1];
        var endColumn = column + width - 1;
        // Often we'll get contiguous blocks of errors on the same line.
        if (_last != null && _last.type === type && _last.line === line && _last.end === column - 1) {
          // So we just merge them into 1 block.
          _last.end = endColumn;
        } else {
          (0, _assert2['default'])(type === 'unchecked' || type === 'partial');
          results.push({
            type: type,
            line: line,
            start: column,
            end: endColumn
          });
        }
      }
    }

    var strings = region.text.split('\n');
    (0, _assert2['default'])(strings.length > 0);

    // Add message for each line ending in a new line.
    var lines = strings.slice(0, -1);
    lines.forEach(function (text) {
      addMessage(text.length);
      line += 1;
      column = startColumn;
    });

    // Add message for the last string which does not end in a new line.
    var last = strings[strings.length - 1];
    addMessage(last.length);
    column += last.length;
  });

  return results;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVkUmVnaW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQWVzQixRQUFROzs7Ozs7Ozs7OztBQWV2QixTQUFTLG9DQUFvQyxDQUNsRCxPQUFnQyxFQUNMO0FBQzNCLE1BQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixXQUFPLEVBQUUsQ0FBQztHQUNYOztBQUVELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQUN0QixNQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixNQUFJLE1BQU0sR0FBRyxXQUFXLENBQUM7QUFDekIsTUFBTSxPQUFrQyxHQUFHLEVBQUUsQ0FBQztBQUM5QyxTQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ3hCLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDMUIsUUFBTSxTQUFTLEdBQUcsQUFBQyxJQUFJLEtBQUssV0FBVyxJQUFNLElBQUksS0FBSyxTQUFTLEFBQUMsQ0FBQzs7QUFFakUsYUFBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0FBQ3pCLFVBQUksU0FBUyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDMUIsWUFBTSxLQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekMsWUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7O0FBRXJDLFlBQUksS0FBSSxJQUFJLElBQUksSUFBSSxLQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFDL0IsS0FBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksS0FBSSxDQUFDLEdBQUcsS0FBSyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztBQUVwRCxlQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztTQUN0QixNQUFNO0FBQ0wsbUNBQVUsQUFBQyxJQUFJLEtBQUssV0FBVyxJQUFNLElBQUksS0FBSyxTQUFTLEFBQUMsQ0FBQyxDQUFDO0FBQzFELGlCQUFPLENBQUMsSUFBSSxDQUFDO0FBQ1gsZ0JBQUksRUFBSixJQUFJO0FBQ0osZ0JBQUksRUFBSixJQUFJO0FBQ0osaUJBQUssRUFBRSxNQUFNO0FBQ2IsZUFBRyxFQUFFLFNBQVM7V0FDZixDQUFDLENBQUM7U0FDSjtPQUNGO0tBQ0Y7O0FBRUQsUUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsNkJBQVUsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7O0FBRzlCLFFBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNwQixnQkFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFJLElBQUksQ0FBQyxDQUFDO0FBQ1YsWUFBTSxHQUFHLFdBQVcsQ0FBQztLQUN0QixDQUFDLENBQUM7OztBQUdILFFBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGNBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7R0FDdkIsQ0FBQyxDQUFDOztBQUVILFNBQU8sT0FBTyxDQUFDO0NBQ2hCIiwiZmlsZSI6IlR5cGVkUmVnaW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgSGFja1R5cGVkUmVnaW9uLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbi8vIEEgcmVnaW9uIG9mIHVudHlwZWQgY29kZS5cbi8vIEN1cnJlbnRseSBtYXkgbm90IHNwYW4gbXVsdGlwbGUgbGluZXMuIENvbnNpZGVyIGVuYWJsaW5nIG11bHRpLWxpbmUgcmVnaW9ucy5cbi8vXG4vLyBzdGFydC9lbmQgYXJlIGNvbHVtbiBpbmRpY2VzLlxuLy8gTGluZS9zdGFydC9lbmQgYXJlIDEgYmFzZWQuXG4vLyBlbmQgaXMgaW5jbHVzaXZlLlxuZXhwb3J0IHR5cGUgVHlwZUNvdmVyYWdlUmVnaW9uID0ge1xuICB0eXBlOiAndW5jaGVja2VkJyB8ICdwYXJ0aWFsJztcbiAgbGluZTogbnVtYmVyO1xuICBzdGFydDogbnVtYmVyO1xuICBlbmQ6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnMoXG4gIHJlZ2lvbnM6ID9BcnJheTxIYWNrVHlwZWRSZWdpb24+XG4pOiBBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+IHtcbiAgaWYgKHJlZ2lvbnMgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0Q29sdW1uID0gMTtcbiAgbGV0IGxpbmUgPSAxO1xuICBsZXQgY29sdW1uID0gc3RhcnRDb2x1bW47XG4gIGNvbnN0IHJlc3VsdHM6IEFycmF5PFR5cGVDb3ZlcmFnZVJlZ2lvbj4gPSBbXTtcbiAgcmVnaW9ucy5mb3JFYWNoKHJlZ2lvbiA9PiB7XG4gICAgY29uc3QgdHlwZSA9IHJlZ2lvbi5jb2xvcjtcbiAgICBjb25zdCBpc01lc3NhZ2UgPSAodHlwZSA9PT0gJ3VuY2hlY2tlZCcpIHx8ICh0eXBlID09PSAncGFydGlhbCcpO1xuXG4gICAgZnVuY3Rpb24gYWRkTWVzc2FnZSh3aWR0aCkge1xuICAgICAgaWYgKGlzTWVzc2FnZSAmJiB3aWR0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHJlc3VsdHNbcmVzdWx0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgY29uc3QgZW5kQ29sdW1uID0gY29sdW1uICsgd2lkdGggLSAxO1xuICAgICAgICAvLyBPZnRlbiB3ZSdsbCBnZXQgY29udGlndW91cyBibG9ja3Mgb2YgZXJyb3JzIG9uIHRoZSBzYW1lIGxpbmUuXG4gICAgICAgIGlmIChsYXN0ICE9IG51bGwgJiYgbGFzdC50eXBlID09PSB0eXBlXG4gICAgICAgICAgICAmJiBsYXN0LmxpbmUgPT09IGxpbmUgJiYgbGFzdC5lbmQgPT09IGNvbHVtbiAtIDEpIHtcbiAgICAgICAgICAvLyBTbyB3ZSBqdXN0IG1lcmdlIHRoZW0gaW50byAxIGJsb2NrLlxuICAgICAgICAgIGxhc3QuZW5kID0gZW5kQ29sdW1uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludmFyaWFudCgodHlwZSA9PT0gJ3VuY2hlY2tlZCcpIHx8ICh0eXBlID09PSAncGFydGlhbCcpKTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGxpbmUsXG4gICAgICAgICAgICBzdGFydDogY29sdW1uLFxuICAgICAgICAgICAgZW5kOiBlbmRDb2x1bW4sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzdHJpbmdzID0gcmVnaW9uLnRleHQuc3BsaXQoJ1xcbicpO1xuICAgIGludmFyaWFudChzdHJpbmdzLmxlbmd0aCA+IDApO1xuXG4gICAgLy8gQWRkIG1lc3NhZ2UgZm9yIGVhY2ggbGluZSBlbmRpbmcgaW4gYSBuZXcgbGluZS5cbiAgICBjb25zdCBsaW5lcyA9IHN0cmluZ3Muc2xpY2UoMCwgLTEpO1xuICAgIGxpbmVzLmZvckVhY2godGV4dCA9PiB7XG4gICAgICBhZGRNZXNzYWdlKHRleHQubGVuZ3RoKTtcbiAgICAgIGxpbmUgKz0gMTtcbiAgICAgIGNvbHVtbiA9IHN0YXJ0Q29sdW1uO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIG1lc3NhZ2UgZm9yIHRoZSBsYXN0IHN0cmluZyB3aGljaCBkb2VzIG5vdCBlbmQgaW4gYSBuZXcgbGluZS5cbiAgICBjb25zdCBsYXN0ID0gc3RyaW5nc1tzdHJpbmdzLmxlbmd0aCAtIDFdO1xuICAgIGFkZE1lc3NhZ2UobGFzdC5sZW5ndGgpO1xuICAgIGNvbHVtbiArPSBsYXN0Lmxlbmd0aDtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iXX0=