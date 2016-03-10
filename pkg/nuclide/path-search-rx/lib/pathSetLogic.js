Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.intersect = intersect;
exports.intersectMany = intersectMany;
exports.enumerateAllCombinations = enumerateAllCombinations;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function intersect(s1, s2) {
  // For optimal perf, iterate the smaller set:
  var _ref = s1.size > s2.size ? [s2, s1] : [s1, s2];

  var _ref2 = _slicedToArray(_ref, 2);

  var smallerSet = _ref2[0];
  var largerSet = _ref2[1];

  var intersection = new Set();
  for (var item of smallerSet) {
    if (largerSet.has(item)) {
      intersection.add(item);
    }
  }
  return intersection;
}

/**
 * Returns the intersection of all sets in `sets`.
 * The first element in `sets` is assumed to be the smallest set.
 * This allows us to quickly calculate the intersection in O(nm),
 * where n is the first (smallest) element in `sets`, and m is length of `sets`.
 *
 * Guaranteed to return a new Set, without side effects.
 */

function intersectMany(sets) {
  if (sets.length === 0) {
    return new Set();
  }
  if (sets.length === 1) {
    return new Set(sets[0]);
  }
  // Start out with the first item.
  // $FlowIssue: t6187050 (computed properties)
  var iter = sets[Symbol.iterator]();
  // Re-use the input set to avoid creating an unnecessary copy.
  // `intersection` is guaranteed to be overwritten with a new Set before the function returns.
  var intersection = iter.next().value;
  for (var s of iter) {
    intersection = intersect(s, intersection);
  }
  return intersection;
}

/**
 * Given a list of items e.g. [ABC], return all combinations, i.e. [[ABC][AB][AC][BC][A][B][C]].
 *
 * Optimized for the use-case of enumerating all possible non-empty combinations of Sets, ordered
 * by descending cardinality. This is a preprocessing step for lazily creating maximally constrained
 * subsets of all items in all sets by calculating the intersection of each returned combination.
 *
 * The implementation assigns a bit to each item in `sets`, and enumerates combinations via bitwise
 * `and`. It is thus only suited for sets of size < 32, though realistic numbers are lower due to
 * the exponential (2^n-1) combination growth.
 */

function enumerateAllCombinations(sets) {
  var combos = [];
  var combinationCount = Math.pow(2, sets.length) - 1;
  // Since we want to intersect the results, enumerate "backwards", in order to generate
  // the most constrained intersections first.
  for (var i = combinationCount; i > 0; i--) {
    var s = [];
    for (var a = 0; a < sets.length; a++) {
      /* eslint-disable no-bitwise */
      if ((i & 1 << a) !== 0) {
        s.push(sets[a]);
      }
      /* eslint-enable no-bitwise */
    }
    combos.push(s);
  }
  return combos.sort(function (a, b) {
    return b.length - a.length;
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdGhTZXRMb2dpYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXTyxTQUFTLFNBQVMsQ0FBSSxFQUFVLEVBQUUsRUFBVSxFQUFVOzthQUUzQixFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDOzs7O01BQWhFLFVBQVU7TUFBRSxTQUFTOztBQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQy9CLE9BQUssSUFBTSxJQUFJLElBQUksVUFBVSxFQUFFO0FBQzdCLFFBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN2QixrQkFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4QjtHQUNGO0FBQ0QsU0FBTyxZQUFZLENBQUM7Q0FDckI7Ozs7Ozs7Ozs7O0FBVU0sU0FBUyxhQUFhLENBQUksSUFBbUIsRUFBVTtBQUM1RCxNQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3JCLFdBQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUNsQjtBQUNELE1BQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDckIsV0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6Qjs7O0FBR0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDOzs7QUFHckMsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNyQyxPQUFLLElBQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtBQUNwQixnQkFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7R0FDM0M7QUFDRCxTQUFPLFlBQVksQ0FBQztDQUNyQjs7Ozs7Ozs7Ozs7Ozs7QUFhTSxTQUFTLHdCQUF3QixDQUFJLElBQWMsRUFBbUI7QUFDM0UsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBR3RELE9BQUssSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxRQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDYixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7QUFFcEMsVUFBSSxDQUFDLENBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQU0sQ0FBQyxFQUFFO0FBQ3hCLFNBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDakI7O0tBRUY7QUFDRCxVQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2hCO0FBQ0QsU0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7V0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNO0dBQUEsQ0FBQyxDQUFDO0NBQ25EIiwiZmlsZSI6InBhdGhTZXRMb2dpYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3Q8VD4oczE6IFNldDxUPiwgczI6IFNldDxUPik6IFNldDxUPiB7XG4gIC8vIEZvciBvcHRpbWFsIHBlcmYsIGl0ZXJhdGUgdGhlIHNtYWxsZXIgc2V0OlxuICBjb25zdCBbc21hbGxlclNldCwgbGFyZ2VyU2V0XSA9IHMxLnNpemUgPiBzMi5zaXplID8gW3MyLCBzMV0gOiBbczEsIHMyXTtcbiAgY29uc3QgaW50ZXJzZWN0aW9uID0gbmV3IFNldCgpO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2Ygc21hbGxlclNldCkge1xuICAgIGlmIChsYXJnZXJTZXQuaGFzKGl0ZW0pKSB7XG4gICAgICBpbnRlcnNlY3Rpb24uYWRkKGl0ZW0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaW50ZXJzZWN0aW9uO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludGVyc2VjdGlvbiBvZiBhbGwgc2V0cyBpbiBgc2V0c2AuXG4gKiBUaGUgZmlyc3QgZWxlbWVudCBpbiBgc2V0c2AgaXMgYXNzdW1lZCB0byBiZSB0aGUgc21hbGxlc3Qgc2V0LlxuICogVGhpcyBhbGxvd3MgdXMgdG8gcXVpY2tseSBjYWxjdWxhdGUgdGhlIGludGVyc2VjdGlvbiBpbiBPKG5tKSxcbiAqIHdoZXJlIG4gaXMgdGhlIGZpcnN0IChzbWFsbGVzdCkgZWxlbWVudCBpbiBgc2V0c2AsIGFuZCBtIGlzIGxlbmd0aCBvZiBgc2V0c2AuXG4gKlxuICogR3VhcmFudGVlZCB0byByZXR1cm4gYSBuZXcgU2V0LCB3aXRob3V0IHNpZGUgZWZmZWN0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdE1hbnk8VD4oc2V0czogQXJyYXk8U2V0PFQ+Pik6IFNldDxUPiB7XG4gIGlmIChzZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgU2V0KCk7XG4gIH1cbiAgaWYgKHNldHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIG5ldyBTZXQoc2V0c1swXSk7XG4gIH1cbiAgLy8gU3RhcnQgb3V0IHdpdGggdGhlIGZpcnN0IGl0ZW0uXG4gIC8vICRGbG93SXNzdWU6IHQ2MTg3MDUwIChjb21wdXRlZCBwcm9wZXJ0aWVzKVxuICBjb25zdCBpdGVyID0gc2V0c1tTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIC8vIFJlLXVzZSB0aGUgaW5wdXQgc2V0IHRvIGF2b2lkIGNyZWF0aW5nIGFuIHVubmVjZXNzYXJ5IGNvcHkuXG4gIC8vIGBpbnRlcnNlY3Rpb25gIGlzIGd1YXJhbnRlZWQgdG8gYmUgb3ZlcndyaXR0ZW4gd2l0aCBhIG5ldyBTZXQgYmVmb3JlIHRoZSBmdW5jdGlvbiByZXR1cm5zLlxuICBsZXQgaW50ZXJzZWN0aW9uID0gaXRlci5uZXh0KCkudmFsdWU7XG4gIGZvciAoY29uc3QgcyBvZiBpdGVyKSB7XG4gICAgaW50ZXJzZWN0aW9uID0gaW50ZXJzZWN0KHMsIGludGVyc2VjdGlvbik7XG4gIH1cbiAgcmV0dXJuIGludGVyc2VjdGlvbjtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgaXRlbXMgZS5nLiBbQUJDXSwgcmV0dXJuIGFsbCBjb21iaW5hdGlvbnMsIGkuZS4gW1tBQkNdW0FCXVtBQ11bQkNdW0FdW0JdW0NdXS5cbiAqXG4gKiBPcHRpbWl6ZWQgZm9yIHRoZSB1c2UtY2FzZSBvZiBlbnVtZXJhdGluZyBhbGwgcG9zc2libGUgbm9uLWVtcHR5IGNvbWJpbmF0aW9ucyBvZiBTZXRzLCBvcmRlcmVkXG4gKiBieSBkZXNjZW5kaW5nIGNhcmRpbmFsaXR5LiBUaGlzIGlzIGEgcHJlcHJvY2Vzc2luZyBzdGVwIGZvciBsYXppbHkgY3JlYXRpbmcgbWF4aW1hbGx5IGNvbnN0cmFpbmVkXG4gKiBzdWJzZXRzIG9mIGFsbCBpdGVtcyBpbiBhbGwgc2V0cyBieSBjYWxjdWxhdGluZyB0aGUgaW50ZXJzZWN0aW9uIG9mIGVhY2ggcmV0dXJuZWQgY29tYmluYXRpb24uXG4gKlxuICogVGhlIGltcGxlbWVudGF0aW9uIGFzc2lnbnMgYSBiaXQgdG8gZWFjaCBpdGVtIGluIGBzZXRzYCwgYW5kIGVudW1lcmF0ZXMgY29tYmluYXRpb25zIHZpYSBiaXR3aXNlXG4gKiBgYW5kYC4gSXQgaXMgdGh1cyBvbmx5IHN1aXRlZCBmb3Igc2V0cyBvZiBzaXplIDwgMzIsIHRob3VnaCByZWFsaXN0aWMgbnVtYmVycyBhcmUgbG93ZXIgZHVlIHRvXG4gKiB0aGUgZXhwb25lbnRpYWwgKDJebi0xKSBjb21iaW5hdGlvbiBncm93dGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnVtZXJhdGVBbGxDb21iaW5hdGlvbnM8VD4oc2V0czogQXJyYXk8VD4pOiBBcnJheTxBcnJheTxUPj4ge1xuICBjb25zdCBjb21ib3MgPSBbXTtcbiAgY29uc3QgY29tYmluYXRpb25Db3VudCA9IE1hdGgucG93KDIsIHNldHMubGVuZ3RoKSAtIDE7XG4gIC8vIFNpbmNlIHdlIHdhbnQgdG8gaW50ZXJzZWN0IHRoZSByZXN1bHRzLCBlbnVtZXJhdGUgXCJiYWNrd2FyZHNcIiwgaW4gb3JkZXIgdG8gZ2VuZXJhdGVcbiAgLy8gdGhlIG1vc3QgY29uc3RyYWluZWQgaW50ZXJzZWN0aW9ucyBmaXJzdC5cbiAgZm9yIChsZXQgaSA9IGNvbWJpbmF0aW9uQ291bnQ7IGkgPiAwOyBpLS0pIHtcbiAgICBjb25zdCBzID0gW107XG4gICAgZm9yIChsZXQgYSA9IDA7IGEgPCBzZXRzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1iaXR3aXNlICovXG4gICAgICBpZiAoKGkgJiAoMSA8PCBhKSkgIT09IDApIHtcbiAgICAgICAgcy5wdXNoKHNldHNbYV0pO1xuICAgICAgfVxuICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1iaXR3aXNlICovXG4gICAgfVxuICAgIGNvbWJvcy5wdXNoKHMpO1xuICB9XG4gIHJldHVybiBjb21ib3Muc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG59XG4iXX0=