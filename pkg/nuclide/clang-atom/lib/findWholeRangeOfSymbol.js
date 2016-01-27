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
var OBJC_SELECTOR_NAME_REGEX = /([^\s:]+:)+/g;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbmRXaG9sZVJhbmdlT2ZTeW1ib2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6ImVBYWdCLE9BQU8sQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7OztBQUdaLElBQU0sd0JBQXdCLEdBQUcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJoRCxTQUFTLHNCQUFzQixDQUMzQixVQUFzQixFQUN0QixJQUFZLEVBQ1osU0FBZ0IsRUFDaEIsUUFBaUIsRUFDakIsTUFBeUIsRUFDTjtBQUNyQixNQUFJLENBQUMsUUFBUSxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDbEMsV0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3BCLE1BQU0sSUFBSSxBQUFDLElBQUksR0FBRyxHQUFHLEtBQU0sUUFBUSxFQUFFOztBQUVwQyxRQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRixXQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkIsTUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsRUFBRTs7Ozs7Ozs7QUFPbkQsVUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDOztBQUVsQixVQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0QsVUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV2RCxVQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0MsVUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQUksSUFBd0MsRUFBSztZQUE1QyxLQUFLLEdBQU4sSUFBd0MsQ0FBdkMsS0FBSztZQUFFLFNBQVMsR0FBakIsSUFBd0MsQ0FBaEMsU0FBUztZQUFFLEtBQUssR0FBeEIsSUFBd0MsQ0FBckIsS0FBSztZQUFFLElBQUksR0FBOUIsSUFBd0MsQ0FBZCxJQUFJO1lBQUUsT0FBTyxHQUF2QyxJQUF3QyxDQUFSLE9BQU87O0FBQ3ZELFlBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxpQkFBTztTQUNSO0FBQ0QsY0FBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQixZQUFJLEVBQUUsQ0FBQztPQUNSLENBQUM7QUFDRixXQUFLLElBQU0sZUFBZSxJQUFJLGdCQUFnQixFQUFFO0FBQzlDLFlBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWhDLG1CQUFTO1NBQ1Y7O0FBRUQsWUFBTSxnQkFBZ0IsR0FBRyxlQUFlLEdBQUcsR0FBRyxDQUFDO0FBQy9DLFlBQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRTNDLFlBQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUM7QUFDM0QsWUFBTSxVQUFVLEdBQUcsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQztBQUNyRixZQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7O0FBRXJELGtCQUFVLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztPQUM1RDtBQUNEO1dBQU8sTUFBTTtRQUFDOzs7O0dBQ2YsTUFBTTtBQUNMLFdBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUNwQjtDQUNGOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsc0JBQXNCLENBQUMiLCJmaWxlIjoiZmluZFdob2xlUmFuZ2VPZlN5bWJvbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDbGFuZ0N1cnNvckV4dGVudH0gZnJvbSAnLi4vLi4vY2xhbmcnO1xuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG4vLyBNYXRjaGVzIHNvbWV0aGluZyBsaWtlOiB0ZXh0QTogb3IgdGV4dEE6dGV4dEI6XG5jb25zdCBPQkpDX1NFTEVDVE9SX05BTUVfUkVHRVggPSAvKFteXFxzOl0rOikrL2c7XG5cbi8qKlxuICogbGliY2xhbmcgZG9lc24ndCBzZWVtIHRvIGJlIGFibGUgdG8gcmV0dXJuIG11bHRpcGxlIHJhbmdlcyB0byBkZWZpbmUgdGhlIGxvY2F0aW9uXG4gKiBvZiBhIHN5bWJvbCwgd2hpY2ggaXMgbmVjZXNzYXJ5IGZvciBPYmotQyBzZWxlY3RvcnMuIChBdCBsZWFzdCwgdGhpcyBmdW5jdGlvbmFsaXR5XG4gKiBpcyBub3QgZXhwb3NlZCBpbiB0aGUgbGliY2xhbmcgcHl0aG9uIGJpbmRpbmdzLilcbiAqIFNvIHdlIGRlcml2ZSB0aGUgbG9jYXRpb24gb2YgYSBzeW1ib2wgdXNpbmcgdGhlIHN5bWJvbCdzICdzcGVsbGluZycuXG4gKiBUaGUgJ3NwZWxsaW5nJyByZXR1cm5lZCBpcyB0aGUgbmFtZSBvZiB0aGUgY2xpY2tlZCBzeW1ib2wuIFVzdWFsbHkgdGhlIHNwZWxsaW5nXG4gKiBpcyB0aGUgc2FtZSBhcyB0aGUgd29yZCB0aGF0IHdhcyBjbGlja2VkLiBUaGUgY2hhbGxlbmdpbmcgY2FzZSBpcyB0aGUgT2JqLUMgc2VsZWN0b3IsXG4gKiBlLmcuICdvYmplY3RGb3JLZXk6dXNpbmdCbG9jazonLCB3aGljaCBtYXkgYXBwZWFyIGluIGNvZGUgYXMgbXVsdGlwbGUgc2VnbWVudHNcbiAqIHNlcGFyYXRlZCBieSBvdGhlciB0ZXh0LiBUaHVzIHdlIG5lZWQgdG8gZmlndXJlIG91dCB0aGUgcmFuZ2VzIHRoZSBzZWdtZW50cyBvY2N1ciBpbi5cbiAqIEBwYXJhbSB0ZXh0RWRpdG9yIFRoZSBUZXh0RWRpdG9yIHRoYXQgY29udGFpbnMgdGhlIHN5bWJvbCBvZiBpbnRlcmVzdC5cbiAqIEBwYXJhbSB0ZXh0IFRoZSB3b3JkIGltbWVkaWF0ZWx5IHVuZGVyIHRoZSBjdXJzb3IsIGFzIHJldHVybmVkIGJ5IEh5cGVyY2xpY2suXG4gKiBAcGFyYW0gdGV4dFJhbmdlIFRoZSByYW5nZSBvZiBgdGV4dGAgd2l0aGluIGB0ZXh0RWRpdG9yYC5cbiAqIEBwYXJhbSBzcGVsbGluZyBUaGUgd2hvbGUgbmFtZSBvZiB0aGUgc3ltYm9sLCBhcyByZXBvcnRlZCBieSBsaWJjbGFuZy4gTWF5IGJlXG4gKiAgIG51bGwgaWYgbGliY2xhbmcgcmVwb3J0cyBubyBzcGVsbGluZyAoZS5nLiBmb3IgQysrIGZpbGVzKS5cbiAqIEBwYXJhbSBleHRlbnQgVGhlICdleHRlbnQnIG9mIHRoZSBzeW1ib2wsIGFzIHJldHVybmVkIGJ5IGxpYmNsYW5nJ3MgQ3Vyc29yLmV4dGVudC5cbiAqIEByZXR1cm4gVGhlIHRydWUgcmFuZ2Ugb2YgdGhlIHN5bWJvbCwgd2hpY2ggbWF5IGV4dGVuZCBiZXlvbmQgdGhlIGB0ZXh0YCB3b3JkLlxuICovXG5mdW5jdGlvbiBmaW5kV2hvbGVSYW5nZU9mU3ltYm9sKFxuICAgIHRleHRFZGl0b3I6IFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHRleHRSYW5nZTogUmFuZ2UsXG4gICAgc3BlbGxpbmc6ID9zdHJpbmcsXG4gICAgZXh0ZW50OiBDbGFuZ0N1cnNvckV4dGVudCxcbiAgKTogQXJyYXk8YXRvbSRSYW5nZT4ge1xuICBpZiAoIXNwZWxsaW5nIHx8IHRleHQgPT09IHNwZWxsaW5nKSB7XG4gICAgcmV0dXJuIFt0ZXh0UmFuZ2VdO1xuICB9IGVsc2UgaWYgKCh0ZXh0ICsgJzonKSA9PT0gc3BlbGxpbmcpIHtcbiAgICAvLyBRdWljayBjaGVjayBmb3IgYSBjb21tb24gY2FzZSwgYW4gT2JqLUMgc2VsZWN0b3Igd2l0aCBvbmUgYXJndW1lbnQuXG4gICAgY29uc3QgbmV3UmFuZ2UgPSBuZXcgUmFuZ2UodGV4dFJhbmdlLnN0YXJ0LCBbdGV4dFJhbmdlLmVuZC5yb3csIHRleHRSYW5nZS5lbmQuY29sdW1uICsgMV0pO1xuICAgIHJldHVybiBbbmV3UmFuZ2VdO1xuICB9IGVsc2UgaWYgKHNwZWxsaW5nLm1hdGNoKE9CSkNfU0VMRUNUT1JfTkFNRV9SRUdFWCkpIHtcbiAgICAvLyBPYmotQyBzZWxlY3RvciB3aXRoIG11bHRpcGxlIGFyZ3VtZW50cywgZS5nLiBkb0Zvbzp3aXRoQmFyOlxuICAgIC8vIFRoaXMgaW1wbGVtZW50YXRpb24gdXNlcyBhIHNpbXBsZSBncmVlZHkgaGV1cmlzdGljIHRvIGZpbmQgdGhlIGxvY2F0aW9uIG9mXG4gICAgLy8gdGhlIGRpZmZlcmVudCBwYXJ0cyBvZiBhIHNlbGVjdG9yLiBJdCBmYWlscyBpZiBwYXJ0cyBvZiBhIHNlbGVjdG9yIGFwcGVhclxuICAgIC8vIG5lc3RlZCBpbiBhcmd1bWVudHMgdG8gdGhlIHNlbGVjdG9yLCBzdWNoIGFzIGluIHRoZSBjYXNlIG9mXG4gICAgLy8gYFthVGhpbmcgZG9Gb286W2Fub3RoZXJUaGluZyB3aXRoQmFyOmFCYXJdIHdpdGhCYXI6YUJhcl1gLlxuICAgIC8vIFRPRE8gKHQ4MTMxOTg2KSBJbXByb3ZlIHRoaXMgaW1wbGVtZW50YXRpb24uXG4gICAgY29uc3QgcmFuZ2VzID0gW107XG5cbiAgICBjb25zdCBleHRlbnRTdGFydCA9IFtleHRlbnQuc3RhcnQubGluZSwgZXh0ZW50LnN0YXJ0LmNvbHVtbl07XG4gICAgY29uc3QgZXh0ZW50RW5kID0gW2V4dGVudC5lbmQubGluZSwgZXh0ZW50LmVuZC5jb2x1bW5dO1xuXG4gICAgY29uc3Qgc2VsZWN0b3JTZWdtZW50cyA9IHNwZWxsaW5nLnNwbGl0KCc6Jyk7XG4gICAgY29uc3QgaXRlcmF0b3IgPSAoe21hdGNoLCBtYXRjaFRleHQsIHJhbmdlLCBzdG9wLCByZXBsYWNlfSkgPT4ge1xuICAgICAgaWYgKCFtYXRjaFRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpO1xuICAgICAgc3RvcCgpO1xuICAgIH07XG4gICAgZm9yIChjb25zdCBzZWxlY3RvclNlZ21lbnQgb2Ygc2VsZWN0b3JTZWdtZW50cykge1xuICAgICAgaWYgKHNlbGVjdG9yU2VnbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gVGhlIGxhc3Qgc2VnbWVudCBicm9rZW4gbWF5IGJlIGFuIGVtcHR5IHN0cmluZy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyAnc3BsaXQnIHJlbW92ZXMgdGhlIGNvbG9uLCBidXQgd2Ugd2FudCB0byB1bmRlcmxpbmUgdGhlIGNvbG9uIHRvby5cbiAgICAgIGNvbnN0IHNlZ21lbnRXaXRoQ29sb24gPSBzZWxlY3RvclNlZ21lbnQgKyAnOic7XG4gICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoc2VnbWVudFdpdGhDb2xvbik7XG5cbiAgICAgIGNvbnN0IHJhbmdlT2ZQcmV2aW91c1NlZ21lbnQgPSByYW5nZXNbKHJhbmdlcy5sZW5ndGggLSAxKV07XG4gICAgICBjb25zdCByYW5nZVN0YXJ0ID0gcmFuZ2VPZlByZXZpb3VzU2VnbWVudCA/IHJhbmdlT2ZQcmV2aW91c1NlZ21lbnQuZW5kIDogZXh0ZW50U3RhcnQ7XG4gICAgICBjb25zdCByYW5nZVRvU2NhbiA9IG5ldyBSYW5nZShyYW5nZVN0YXJ0LCBleHRlbnRFbmQpO1xuXG4gICAgICB0ZXh0RWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCByYW5nZVRvU2NhbiwgaXRlcmF0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZ2VzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbdGV4dFJhbmdlXTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbmRXaG9sZVJhbmdlT2ZTeW1ib2w7XG4iXX0=