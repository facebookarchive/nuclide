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

exports.valueComparator = valueComparator;
exports.scoreComparator = scoreComparator;
exports.inverseScoreComparator = inverseScoreComparator;

/**
 * String comparator that lists the capitalized verson of a string before the lowercase version.
 *
 * Apparently String.prototype.localeCompare() is not i18n-aware in Node 0.10.x. There's a ton of
 * debate on this:
 *
 *   https://github.com/joyent/node/issues/6371
 *   https://github.com/joyent/node/issues/7676
 *
 * It appears the version of io.js bundled with Atom has proper i18n support, but it lists
 * lowercase strings before uppercase strings, so we also need this custom function in Atom.
 *
 * @return <0 if a should appear before b in a list; >0 if b should appear before a in a list
 */

function valueComparator(a, b) {
  var len = Math.min(a.length, b.length);
  for (var i = 0; i < len; i++) {
    var charA = a.charAt(i);
    var charB = b.charAt(i);
    if (charA === charB) {
      continue;
    }

    var aUpper = charA.toUpperCase();
    var bUpper = charB.toUpperCase();

    var caseInsensitiveCompare = aUpper.localeCompare(bUpper);
    if (caseInsensitiveCompare !== 0) {
      return caseInsensitiveCompare;
    }

    // If we have reached this point, charA and charB are different, but only one of them is
    // uppercase. The uppercase one should be returned first.
    return charA === aUpper ? -1 : 1;
  }

  return a.length - b.length;
}

/**
 * @return >0 if a is the greater QueryScore; <0 if b is the greater QueryScore.
 */

function scoreComparator(a, b) {
  var cmp = a.score - b.score;
  if (cmp !== 0) {
    return cmp;
  } else {
    return valueComparator(b.value, a.value);
  }
}

function inverseScoreComparator(a, b) {
  return scoreComparator(b, a);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQk8sU0FBUyxlQUFlLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBVTtBQUM1RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsUUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQUksS0FBSyxLQUFLLEtBQUssRUFBRTtBQUNuQixlQUFTO0tBQ1Y7O0FBRUQsUUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25DLFFBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbkMsUUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVELFFBQUksc0JBQXNCLEtBQUssQ0FBQyxFQUFFO0FBQ2hDLGFBQU8sc0JBQXNCLENBQUM7S0FDL0I7Ozs7QUFJRCxXQUFPLEtBQUssS0FBSyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xDOztBQUVELFNBQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0NBQzVCOzs7Ozs7QUFLTSxTQUFTLGVBQWUsQ0FBQyxDQUFhLEVBQUUsQ0FBYSxFQUFVO0FBQ3BFLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM5QixNQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7QUFDYixXQUFPLEdBQUcsQ0FBQztHQUNaLE1BQU07QUFDTCxXQUFPLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUMxQztDQUNGOztBQUVNLFNBQVMsc0JBQXNCLENBQUMsQ0FBYSxFQUFFLENBQWEsRUFBVTtBQUMzRSxTQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDOUIiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UXVlcnlTY29yZX0gZnJvbSAnLi9RdWVyeVNjb3JlJztcblxuLyoqXG4gKiBTdHJpbmcgY29tcGFyYXRvciB0aGF0IGxpc3RzIHRoZSBjYXBpdGFsaXplZCB2ZXJzb24gb2YgYSBzdHJpbmcgYmVmb3JlIHRoZSBsb3dlcmNhc2UgdmVyc2lvbi5cbiAqXG4gKiBBcHBhcmVudGx5IFN0cmluZy5wcm90b3R5cGUubG9jYWxlQ29tcGFyZSgpIGlzIG5vdCBpMThuLWF3YXJlIGluIE5vZGUgMC4xMC54LiBUaGVyZSdzIGEgdG9uIG9mXG4gKiBkZWJhdGUgb24gdGhpczpcbiAqXG4gKiAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvNjM3MVxuICogICBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzc2NzZcbiAqXG4gKiBJdCBhcHBlYXJzIHRoZSB2ZXJzaW9uIG9mIGlvLmpzIGJ1bmRsZWQgd2l0aCBBdG9tIGhhcyBwcm9wZXIgaTE4biBzdXBwb3J0LCBidXQgaXQgbGlzdHNcbiAqIGxvd2VyY2FzZSBzdHJpbmdzIGJlZm9yZSB1cHBlcmNhc2Ugc3RyaW5ncywgc28gd2UgYWxzbyBuZWVkIHRoaXMgY3VzdG9tIGZ1bmN0aW9uIGluIEF0b20uXG4gKlxuICogQHJldHVybiA8MCBpZiBhIHNob3VsZCBhcHBlYXIgYmVmb3JlIGIgaW4gYSBsaXN0OyA+MCBpZiBiIHNob3VsZCBhcHBlYXIgYmVmb3JlIGEgaW4gYSBsaXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZUNvbXBhcmF0b3IoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBsZW4gPSBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgY2hhckEgPSBhLmNoYXJBdChpKTtcbiAgICBjb25zdCBjaGFyQiA9IGIuY2hhckF0KGkpO1xuICAgIGlmIChjaGFyQSA9PT0gY2hhckIpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGFVcHBlciA9IGNoYXJBLnRvVXBwZXJDYXNlKCk7XG4gICAgY29uc3QgYlVwcGVyID0gY2hhckIudG9VcHBlckNhc2UoKTtcblxuICAgIGNvbnN0IGNhc2VJbnNlbnNpdGl2ZUNvbXBhcmUgPSBhVXBwZXIubG9jYWxlQ29tcGFyZShiVXBwZXIpO1xuICAgIGlmIChjYXNlSW5zZW5zaXRpdmVDb21wYXJlICE9PSAwKSB7XG4gICAgICByZXR1cm4gY2FzZUluc2Vuc2l0aXZlQ29tcGFyZTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBoYXZlIHJlYWNoZWQgdGhpcyBwb2ludCwgY2hhckEgYW5kIGNoYXJCIGFyZSBkaWZmZXJlbnQsIGJ1dCBvbmx5IG9uZSBvZiB0aGVtIGlzXG4gICAgLy8gdXBwZXJjYXNlLiBUaGUgdXBwZXJjYXNlIG9uZSBzaG91bGQgYmUgcmV0dXJuZWQgZmlyc3QuXG4gICAgcmV0dXJuIGNoYXJBID09PSBhVXBwZXIgPyAtMSA6IDE7XG4gIH1cblxuICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBAcmV0dXJuID4wIGlmIGEgaXMgdGhlIGdyZWF0ZXIgUXVlcnlTY29yZTsgPDAgaWYgYiBpcyB0aGUgZ3JlYXRlciBRdWVyeVNjb3JlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NvcmVDb21wYXJhdG9yKGE6IFF1ZXJ5U2NvcmUsIGI6IFF1ZXJ5U2NvcmUpOiBudW1iZXIge1xuICBjb25zdCBjbXAgPSBhLnNjb3JlIC0gYi5zY29yZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbHVlQ29tcGFyYXRvcihiLnZhbHVlLCBhLnZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZVNjb3JlQ29tcGFyYXRvcihhOiBRdWVyeVNjb3JlLCBiOiBRdWVyeVNjb3JlKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNjb3JlQ29tcGFyYXRvcihiLCBhKTtcbn1cbiJdfQ==