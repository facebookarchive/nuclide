var _require = require('atom');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Range = _require.Range;

// Matches something like: textA: or textA:textB:
var OBJC_SELECTOR_NAME_REGEX = /([^\s:]+:)+$/g;

/**
 * libclang doesn't seem to be able to return multiple ranges to define the location
 * of a symbol, which is necessary for Obj-C selectors. (At least, this functionality
 * is not exposed in the libclang python bindings.)
 * So we derive the location of a symbol using the symbol's 'spelling'.
 * The 'spelling' returned is the name of the clicked symbol. Usually the spelling
 * is the same as the word that was clicked. The challenging case is the Obj-C selector,
 * e.g. 'objectForKey:usingBlock:', which may appear in code as multiple segments
 * separated by other text. Thus we need to figure out the ranges the segments occur in.
 * @param textEditor The TextEditor that contains the symbol of interest.
 * @param text The word immediately under the cursor, as returned by Hyperclick.
 * @param textRange The range of `text` within `textEditor`.
 * @param spelling The whole name of the symbol, as reported by libclang. May be
 *   null if libclang reports no spelling (e.g. for C++ files).
 * @param extent The 'extent' of the symbol, as returned by libclang's Cursor.extent.
 * @return The true range of the symbol, which may extend beyond the `text` word.
 */
function findWholeRangeOfSymbol(textEditor, text, textRange, spelling, extent) {
  if (!spelling || text === spelling) {
    return [textRange];
  } else if (text + ':' === spelling) {
    // Quick check for a common case, an Obj-C selector with one argument.
    var newRange = new Range(textRange.start, [textRange.end.row, textRange.end.column + 1]);
    return [newRange];
  } else if (spelling.match(OBJC_SELECTOR_NAME_REGEX)) {
    var _ret = (function () {
      // Obj-C selector with multiple arguments, e.g. doFoo:withBar:
      // This implementation uses a simple greedy heuristic to find the location of
      // the different parts of a selector. It fails if parts of a selector appear
      // nested in arguments to the selector, such as in the case of
      // `[aThing doFoo:[anotherThing withBar:aBar] withBar:aBar]`.
      // TODO (t8131986) Improve this implementation.
      var ranges = [];

      var extentStart = [extent.start.line, extent.start.column];
      var extentEnd = [extent.end.line, extent.end.column];

      var selectorSegments = spelling.split(':');
      var iterator = function iterator(_ref) {
        var match = _ref.match;
        var matchText = _ref.matchText;
        var range = _ref.range;
        var stop = _ref.stop;
        var replace = _ref.replace;

        if (!matchText) {
          return;
        }
        ranges.push(range);
        stop();
      };
      for (var selectorSegment of selectorSegments) {
        if (selectorSegment.length === 0) {
          // The last segment broken may be an empty string.
          continue;
        }
        // 'split' removes the colon, but we want to underline the colon too.
        var segmentWithColon = selectorSegment + ':';
        var regex = new RegExp(segmentWithColon);

        var rangeOfPreviousSegment = ranges[ranges.length - 1];
        var rangeStart = rangeOfPreviousSegment ? rangeOfPreviousSegment.end : extentStart;
        var rangeToScan = new Range(rangeStart, extentEnd);

        textEditor.scanInBufferRange(regex, rangeToScan, iterator);
      }
      return {
        v: ranges
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  } else {
    return [textRange];
  }
}

module.exports = findWholeRangeOfSymbol;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbmRXaG9sZVJhbmdlT2ZTeW1ib2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6ImVBYWdCLE9BQU8sQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7OztBQUdaLElBQU0sd0JBQXdCLEdBQUcsZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJqRCxTQUFTLHNCQUFzQixDQUMzQixVQUFzQixFQUN0QixJQUFZLEVBQ1osU0FBZ0IsRUFDaEIsUUFBaUIsRUFDakIsTUFBeUIsRUFDTjtBQUNyQixNQUFJLENBQUMsUUFBUSxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDbEMsV0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3BCLE1BQU0sSUFBSSxBQUFDLElBQUksR0FBRyxHQUFHLEtBQU0sUUFBUSxFQUFFOztBQUVwQyxRQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRixXQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkIsTUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsRUFBRTs7Ozs7Ozs7QUFPbkQsVUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDOztBQUVsQixVQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0QsVUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV2RCxVQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0MsVUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQUksSUFBd0MsRUFBSztZQUE1QyxLQUFLLEdBQU4sSUFBd0MsQ0FBdkMsS0FBSztZQUFFLFNBQVMsR0FBakIsSUFBd0MsQ0FBaEMsU0FBUztZQUFFLEtBQUssR0FBeEIsSUFBd0MsQ0FBckIsS0FBSztZQUFFLElBQUksR0FBOUIsSUFBd0MsQ0FBZCxJQUFJO1lBQUUsT0FBTyxHQUF2QyxJQUF3QyxDQUFSLE9BQU87O0FBQ3ZELFlBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxpQkFBTztTQUNSO0FBQ0QsY0FBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQixZQUFJLEVBQUUsQ0FBQztPQUNSLENBQUM7QUFDRixXQUFLLElBQU0sZUFBZSxJQUFJLGdCQUFnQixFQUFFO0FBQzlDLFlBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWhDLG1CQUFTO1NBQ1Y7O0FBRUQsWUFBTSxnQkFBZ0IsR0FBRyxlQUFlLEdBQUcsR0FBRyxDQUFDO0FBQy9DLFlBQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRTNDLFlBQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUM7QUFDM0QsWUFBTSxVQUFVLEdBQUcsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQztBQUNyRixZQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7O0FBRXJELGtCQUFVLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztPQUM1RDtBQUNEO1dBQU8sTUFBTTtRQUFDOzs7O0dBQ2YsTUFBTTtBQUNMLFdBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUNwQjtDQUNGOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsc0JBQXNCLENBQUMiLCJmaWxlIjoiZmluZFdob2xlUmFuZ2VPZlN5bWJvbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDbGFuZ0N1cnNvckV4dGVudH0gZnJvbSAnLi4vLi4vY2xhbmcnO1xuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG4vLyBNYXRjaGVzIHNvbWV0aGluZyBsaWtlOiB0ZXh0QTogb3IgdGV4dEE6dGV4dEI6XG5jb25zdCBPQkpDX1NFTEVDVE9SX05BTUVfUkVHRVggPSAvKFteXFxzOl0rOikrJC9nO1xuXG4vKipcbiAqIGxpYmNsYW5nIGRvZXNuJ3Qgc2VlbSB0byBiZSBhYmxlIHRvIHJldHVybiBtdWx0aXBsZSByYW5nZXMgdG8gZGVmaW5lIHRoZSBsb2NhdGlvblxuICogb2YgYSBzeW1ib2wsIHdoaWNoIGlzIG5lY2Vzc2FyeSBmb3IgT2JqLUMgc2VsZWN0b3JzLiAoQXQgbGVhc3QsIHRoaXMgZnVuY3Rpb25hbGl0eVxuICogaXMgbm90IGV4cG9zZWQgaW4gdGhlIGxpYmNsYW5nIHB5dGhvbiBiaW5kaW5ncy4pXG4gKiBTbyB3ZSBkZXJpdmUgdGhlIGxvY2F0aW9uIG9mIGEgc3ltYm9sIHVzaW5nIHRoZSBzeW1ib2wncyAnc3BlbGxpbmcnLlxuICogVGhlICdzcGVsbGluZycgcmV0dXJuZWQgaXMgdGhlIG5hbWUgb2YgdGhlIGNsaWNrZWQgc3ltYm9sLiBVc3VhbGx5IHRoZSBzcGVsbGluZ1xuICogaXMgdGhlIHNhbWUgYXMgdGhlIHdvcmQgdGhhdCB3YXMgY2xpY2tlZC4gVGhlIGNoYWxsZW5naW5nIGNhc2UgaXMgdGhlIE9iai1DIHNlbGVjdG9yLFxuICogZS5nLiAnb2JqZWN0Rm9yS2V5OnVzaW5nQmxvY2s6Jywgd2hpY2ggbWF5IGFwcGVhciBpbiBjb2RlIGFzIG11bHRpcGxlIHNlZ21lbnRzXG4gKiBzZXBhcmF0ZWQgYnkgb3RoZXIgdGV4dC4gVGh1cyB3ZSBuZWVkIHRvIGZpZ3VyZSBvdXQgdGhlIHJhbmdlcyB0aGUgc2VnbWVudHMgb2NjdXIgaW4uXG4gKiBAcGFyYW0gdGV4dEVkaXRvciBUaGUgVGV4dEVkaXRvciB0aGF0IGNvbnRhaW5zIHRoZSBzeW1ib2wgb2YgaW50ZXJlc3QuXG4gKiBAcGFyYW0gdGV4dCBUaGUgd29yZCBpbW1lZGlhdGVseSB1bmRlciB0aGUgY3Vyc29yLCBhcyByZXR1cm5lZCBieSBIeXBlcmNsaWNrLlxuICogQHBhcmFtIHRleHRSYW5nZSBUaGUgcmFuZ2Ugb2YgYHRleHRgIHdpdGhpbiBgdGV4dEVkaXRvcmAuXG4gKiBAcGFyYW0gc3BlbGxpbmcgVGhlIHdob2xlIG5hbWUgb2YgdGhlIHN5bWJvbCwgYXMgcmVwb3J0ZWQgYnkgbGliY2xhbmcuIE1heSBiZVxuICogICBudWxsIGlmIGxpYmNsYW5nIHJlcG9ydHMgbm8gc3BlbGxpbmcgKGUuZy4gZm9yIEMrKyBmaWxlcykuXG4gKiBAcGFyYW0gZXh0ZW50IFRoZSAnZXh0ZW50JyBvZiB0aGUgc3ltYm9sLCBhcyByZXR1cm5lZCBieSBsaWJjbGFuZydzIEN1cnNvci5leHRlbnQuXG4gKiBAcmV0dXJuIFRoZSB0cnVlIHJhbmdlIG9mIHRoZSBzeW1ib2wsIHdoaWNoIG1heSBleHRlbmQgYmV5b25kIHRoZSBgdGV4dGAgd29yZC5cbiAqL1xuZnVuY3Rpb24gZmluZFdob2xlUmFuZ2VPZlN5bWJvbChcbiAgICB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICB0ZXh0UmFuZ2U6IFJhbmdlLFxuICAgIHNwZWxsaW5nOiA/c3RyaW5nLFxuICAgIGV4dGVudDogQ2xhbmdDdXJzb3JFeHRlbnQsXG4gICk6IEFycmF5PGF0b20kUmFuZ2U+IHtcbiAgaWYgKCFzcGVsbGluZyB8fCB0ZXh0ID09PSBzcGVsbGluZykge1xuICAgIHJldHVybiBbdGV4dFJhbmdlXTtcbiAgfSBlbHNlIGlmICgodGV4dCArICc6JykgPT09IHNwZWxsaW5nKSB7XG4gICAgLy8gUXVpY2sgY2hlY2sgZm9yIGEgY29tbW9uIGNhc2UsIGFuIE9iai1DIHNlbGVjdG9yIHdpdGggb25lIGFyZ3VtZW50LlxuICAgIGNvbnN0IG5ld1JhbmdlID0gbmV3IFJhbmdlKHRleHRSYW5nZS5zdGFydCwgW3RleHRSYW5nZS5lbmQucm93LCB0ZXh0UmFuZ2UuZW5kLmNvbHVtbiArIDFdKTtcbiAgICByZXR1cm4gW25ld1JhbmdlXTtcbiAgfSBlbHNlIGlmIChzcGVsbGluZy5tYXRjaChPQkpDX1NFTEVDVE9SX05BTUVfUkVHRVgpKSB7XG4gICAgLy8gT2JqLUMgc2VsZWN0b3Igd2l0aCBtdWx0aXBsZSBhcmd1bWVudHMsIGUuZy4gZG9Gb286d2l0aEJhcjpcbiAgICAvLyBUaGlzIGltcGxlbWVudGF0aW9uIHVzZXMgYSBzaW1wbGUgZ3JlZWR5IGhldXJpc3RpYyB0byBmaW5kIHRoZSBsb2NhdGlvbiBvZlxuICAgIC8vIHRoZSBkaWZmZXJlbnQgcGFydHMgb2YgYSBzZWxlY3Rvci4gSXQgZmFpbHMgaWYgcGFydHMgb2YgYSBzZWxlY3RvciBhcHBlYXJcbiAgICAvLyBuZXN0ZWQgaW4gYXJndW1lbnRzIHRvIHRoZSBzZWxlY3Rvciwgc3VjaCBhcyBpbiB0aGUgY2FzZSBvZlxuICAgIC8vIGBbYVRoaW5nIGRvRm9vOlthbm90aGVyVGhpbmcgd2l0aEJhcjphQmFyXSB3aXRoQmFyOmFCYXJdYC5cbiAgICAvLyBUT0RPICh0ODEzMTk4NikgSW1wcm92ZSB0aGlzIGltcGxlbWVudGF0aW9uLlxuICAgIGNvbnN0IHJhbmdlcyA9IFtdO1xuXG4gICAgY29uc3QgZXh0ZW50U3RhcnQgPSBbZXh0ZW50LnN0YXJ0LmxpbmUsIGV4dGVudC5zdGFydC5jb2x1bW5dO1xuICAgIGNvbnN0IGV4dGVudEVuZCA9IFtleHRlbnQuZW5kLmxpbmUsIGV4dGVudC5lbmQuY29sdW1uXTtcblxuICAgIGNvbnN0IHNlbGVjdG9yU2VnbWVudHMgPSBzcGVsbGluZy5zcGxpdCgnOicpO1xuICAgIGNvbnN0IGl0ZXJhdG9yID0gKHttYXRjaCwgbWF0Y2hUZXh0LCByYW5nZSwgc3RvcCwgcmVwbGFjZX0pID0+IHtcbiAgICAgIGlmICghbWF0Y2hUZXh0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKTtcbiAgICAgIHN0b3AoKTtcbiAgICB9O1xuICAgIGZvciAoY29uc3Qgc2VsZWN0b3JTZWdtZW50IG9mIHNlbGVjdG9yU2VnbWVudHMpIHtcbiAgICAgIGlmIChzZWxlY3RvclNlZ21lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIFRoZSBsYXN0IHNlZ21lbnQgYnJva2VuIG1heSBiZSBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gJ3NwbGl0JyByZW1vdmVzIHRoZSBjb2xvbiwgYnV0IHdlIHdhbnQgdG8gdW5kZXJsaW5lIHRoZSBjb2xvbiB0b28uXG4gICAgICBjb25zdCBzZWdtZW50V2l0aENvbG9uID0gc2VsZWN0b3JTZWdtZW50ICsgJzonO1xuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHNlZ21lbnRXaXRoQ29sb24pO1xuXG4gICAgICBjb25zdCByYW5nZU9mUHJldmlvdXNTZWdtZW50ID0gcmFuZ2VzWyhyYW5nZXMubGVuZ3RoIC0gMSldO1xuICAgICAgY29uc3QgcmFuZ2VTdGFydCA9IHJhbmdlT2ZQcmV2aW91c1NlZ21lbnQgPyByYW5nZU9mUHJldmlvdXNTZWdtZW50LmVuZCA6IGV4dGVudFN0YXJ0O1xuICAgICAgY29uc3QgcmFuZ2VUb1NjYW4gPSBuZXcgUmFuZ2UocmFuZ2VTdGFydCwgZXh0ZW50RW5kKTtcblxuICAgICAgdGV4dEVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgcmFuZ2VUb1NjYW4sIGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlcztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW3RleHRSYW5nZV07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kV2hvbGVSYW5nZU9mU3ltYm9sO1xuIl19