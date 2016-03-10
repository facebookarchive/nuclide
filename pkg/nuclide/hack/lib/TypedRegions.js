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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVkUmVnaW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQWVzQixRQUFROzs7Ozs7Ozs7OztBQWV2QixTQUFTLG9DQUFvQyxDQUNsRCxPQUFnQyxFQUNMO0FBQzNCLE1BQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixXQUFPLEVBQUUsQ0FBQztHQUNYOztBQUVELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQUN0QixNQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixNQUFJLE1BQU0sR0FBRyxXQUFXLENBQUM7QUFDekIsTUFBTSxPQUFrQyxHQUFHLEVBQUUsQ0FBQztBQUM5QyxTQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ3hCLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDMUIsUUFBTSxTQUFTLEdBQUcsQUFBQyxJQUFJLEtBQUssV0FBVyxJQUFNLElBQUksS0FBSyxTQUFTLEFBQUMsQ0FBQzs7QUFFakUsYUFBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0FBQ3pCLFVBQUksU0FBUyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDMUIsWUFBTSxLQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekMsWUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7O0FBRXJDLFlBQUksS0FBSSxJQUFJLElBQUksSUFBSSxLQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFDL0IsS0FBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksS0FBSSxDQUFDLEdBQUcsS0FBSyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztBQUVwRCxlQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztTQUN0QixNQUFNO0FBQ0wsbUNBQVUsQUFBQyxJQUFJLEtBQUssV0FBVyxJQUFNLElBQUksS0FBSyxTQUFTLEFBQUMsQ0FBQyxDQUFDO0FBQzFELGlCQUFPLENBQUMsSUFBSSxDQUFDO0FBQ1gsZ0JBQUksRUFBSixJQUFJO0FBQ0osZ0JBQUksRUFBSixJQUFJO0FBQ0osaUJBQUssRUFBRSxNQUFNO0FBQ2IsZUFBRyxFQUFFLFNBQVM7V0FDZixDQUFDLENBQUM7U0FDSjtPQUNGO0tBQ0Y7O0FBRUQsUUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsNkJBQVUsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7O0FBRzlCLFFBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNwQixnQkFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFJLElBQUksQ0FBQyxDQUFDO0FBQ1YsWUFBTSxHQUFHLFdBQVcsQ0FBQztLQUN0QixDQUFDLENBQUM7OztBQUdILFFBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGNBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7R0FDdkIsQ0FBQyxDQUFDOztBQUVILFNBQU8sT0FBTyxDQUFDO0NBQ2hCIiwiZmlsZSI6IlR5cGVkUmVnaW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgSGFja1R5cGVkUmVnaW9uLFxufSBmcm9tICcuLi8uLi9oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG4vLyBBIHJlZ2lvbiBvZiB1bnR5cGVkIGNvZGUuXG4vLyBDdXJyZW50bHkgbWF5IG5vdCBzcGFuIG11bHRpcGxlIGxpbmVzLiBDb25zaWRlciBlbmFibGluZyBtdWx0aS1saW5lIHJlZ2lvbnMuXG4vL1xuLy8gc3RhcnQvZW5kIGFyZSBjb2x1bW4gaW5kaWNlcy5cbi8vIExpbmUvc3RhcnQvZW5kIGFyZSAxIGJhc2VkLlxuLy8gZW5kIGlzIGluY2x1c2l2ZS5cbmV4cG9ydCB0eXBlIFR5cGVDb3ZlcmFnZVJlZ2lvbiA9IHtcbiAgdHlwZTogJ3VuY2hlY2tlZCcgfCAncGFydGlhbCc7XG4gIGxpbmU6IG51bWJlcjtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFR5cGVkUmVnaW9uc1RvQ292ZXJhZ2VSZWdpb25zKFxuICByZWdpb25zOiA/QXJyYXk8SGFja1R5cGVkUmVnaW9uPlxuKTogQXJyYXk8VHlwZUNvdmVyYWdlUmVnaW9uPiB7XG4gIGlmIChyZWdpb25zID09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBzdGFydENvbHVtbiA9IDE7XG4gIGxldCBsaW5lID0gMTtcbiAgbGV0IGNvbHVtbiA9IHN0YXJ0Q29sdW1uO1xuICBjb25zdCByZXN1bHRzOiBBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+ID0gW107XG4gIHJlZ2lvbnMuZm9yRWFjaChyZWdpb24gPT4ge1xuICAgIGNvbnN0IHR5cGUgPSByZWdpb24uY29sb3I7XG4gICAgY29uc3QgaXNNZXNzYWdlID0gKHR5cGUgPT09ICd1bmNoZWNrZWQnKSB8fCAodHlwZSA9PT0gJ3BhcnRpYWwnKTtcblxuICAgIGZ1bmN0aW9uIGFkZE1lc3NhZ2Uod2lkdGgpIHtcbiAgICAgIGlmIChpc01lc3NhZ2UgJiYgd2lkdGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IGVuZENvbHVtbiA9IGNvbHVtbiArIHdpZHRoIC0gMTtcbiAgICAgICAgLy8gT2Z0ZW4gd2UnbGwgZ2V0IGNvbnRpZ3VvdXMgYmxvY2tzIG9mIGVycm9ycyBvbiB0aGUgc2FtZSBsaW5lLlxuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gdHlwZVxuICAgICAgICAgICAgJiYgbGFzdC5saW5lID09PSBsaW5lICYmIGxhc3QuZW5kID09PSBjb2x1bW4gLSAxKSB7XG4gICAgICAgICAgLy8gU28gd2UganVzdCBtZXJnZSB0aGVtIGludG8gMSBibG9jay5cbiAgICAgICAgICBsYXN0LmVuZCA9IGVuZENvbHVtbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnZhcmlhbnQoKHR5cGUgPT09ICd1bmNoZWNrZWQnKSB8fCAodHlwZSA9PT0gJ3BhcnRpYWwnKSk7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBsaW5lLFxuICAgICAgICAgICAgc3RhcnQ6IGNvbHVtbixcbiAgICAgICAgICAgIGVuZDogZW5kQ29sdW1uLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaW5ncyA9IHJlZ2lvbi50ZXh0LnNwbGl0KCdcXG4nKTtcbiAgICBpbnZhcmlhbnQoc3RyaW5ncy5sZW5ndGggPiAwKTtcblxuICAgIC8vIEFkZCBtZXNzYWdlIGZvciBlYWNoIGxpbmUgZW5kaW5nIGluIGEgbmV3IGxpbmUuXG4gICAgY29uc3QgbGluZXMgPSBzdHJpbmdzLnNsaWNlKDAsIC0xKTtcbiAgICBsaW5lcy5mb3JFYWNoKHRleHQgPT4ge1xuICAgICAgYWRkTWVzc2FnZSh0ZXh0Lmxlbmd0aCk7XG4gICAgICBsaW5lICs9IDE7XG4gICAgICBjb2x1bW4gPSBzdGFydENvbHVtbjtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBtZXNzYWdlIGZvciB0aGUgbGFzdCBzdHJpbmcgd2hpY2ggZG9lcyBub3QgZW5kIGluIGEgbmV3IGxpbmUuXG4gICAgY29uc3QgbGFzdCA9IHN0cmluZ3Nbc3RyaW5ncy5sZW5ndGggLSAxXTtcbiAgICBhZGRNZXNzYWdlKGxhc3QubGVuZ3RoKTtcbiAgICBjb2x1bW4gKz0gbGFzdC5sZW5ndGg7XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIl19