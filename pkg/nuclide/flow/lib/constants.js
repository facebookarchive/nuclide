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

var JS_GRAMMARS = Object.freeze(['source.js', 'source.js.jsx']);

exports.JS_GRAMMARS = JS_GRAMMARS;
var identifierOrNumber = '[a-zA-Z0-9_$]+';

function makeStrRegex(delimiter) {
  var d = delimiter;
  // Each run of four backslashes ends up as just one backslash. We need to escape once for the
  // string literal here, and once for the RegExp compilation.
  return d + '(\\\\.|[^' + d + '\\\\])*' + d;
}

var strRegexes = ['`', "'", '"'].map(makeStrRegex);

var regexStrings = [].concat(strRegexes, [identifierOrNumber]).map(function (s) {
  return '(' + s + ')';
});

var JAVASCRIPT_WORD_REGEX = new RegExp(regexStrings.join('|'), 'g');
exports.JAVASCRIPT_WORD_REGEX = JAVASCRIPT_WORD_REGEX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnN0YW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXTyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7OztBQUV6RSxJQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDOztBQUU1QyxTQUFTLFlBQVksQ0FBQyxTQUFpQixFQUFVO0FBQy9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQzs7O0FBR3BCLFNBQVUsQ0FBQyxpQkFBWSxDQUFDLGVBQVUsQ0FBQyxDQUFHO0NBQ3ZDOztBQUVELElBQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXJELElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBUSxDQUFDO0NBQUcsQ0FBQyxDQUFDOztBQUU3RSxJQUFNLHFCQUFxQixHQUFHLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMiLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuZXhwb3J0IGNvbnN0IEpTX0dSQU1NQVJTID0gT2JqZWN0LmZyZWV6ZShbJ3NvdXJjZS5qcycsICdzb3VyY2UuanMuanN4J10pO1xuXG5jb25zdCBpZGVudGlmaWVyT3JOdW1iZXIgPSAnW2EtekEtWjAtOV8kXSsnO1xuXG5mdW5jdGlvbiBtYWtlU3RyUmVnZXgoZGVsaW1pdGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBkID0gZGVsaW1pdGVyO1xuICAvLyBFYWNoIHJ1biBvZiBmb3VyIGJhY2tzbGFzaGVzIGVuZHMgdXAgYXMganVzdCBvbmUgYmFja3NsYXNoLiBXZSBuZWVkIHRvIGVzY2FwZSBvbmNlIGZvciB0aGVcbiAgLy8gc3RyaW5nIGxpdGVyYWwgaGVyZSwgYW5kIG9uY2UgZm9yIHRoZSBSZWdFeHAgY29tcGlsYXRpb24uXG4gIHJldHVybiBgJHtkfShcXFxcXFxcXC58W14ke2R9XFxcXFxcXFxdKSoke2R9YDtcbn1cblxuY29uc3Qgc3RyUmVnZXhlcyA9IFsnYCcsIFwiJ1wiLCAnXCInXS5tYXAobWFrZVN0clJlZ2V4KTtcblxuY29uc3QgcmVnZXhTdHJpbmdzID0gW10uY29uY2F0KHN0clJlZ2V4ZXMsIFtpZGVudGlmaWVyT3JOdW1iZXJdKS5tYXAocyA9PiBgKCR7c30pYCk7XG5cbmV4cG9ydCBjb25zdCBKQVZBU0NSSVBUX1dPUkRfUkVHRVggPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5ncy5qb2luKCd8JyksICdnJyk7XG4iXX0=