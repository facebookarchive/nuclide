function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/**
 * This file contains a set of custom matchers for jasmine testing, as described
 * here: http://jasmine.github.io/1.3/introduction.html#section-Writing_a_custom_matcher.
 */

/**
 * Determines if two Ranges are equal. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the Ranges are equal.
 */
function toEqualAtomRange(expected) {
  return !!this.actual && !!expected && this.actual.isEqual(expected);
}

/**
 * Same as `toEqualAtomRange` but for an array of Ranges. This function should
 * not be called directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the array of Ranges are equal.
 */
function toEqualAtomRanges(expected) {
  var allEqual = true;
  if (!this.actual || !expected) {
    return false;
  }
  this.actual.some(function (range, index) {
    (0, _assert2['default'])(expected); // Tell Flow this is definitely non-null now.
    if (range.isEqual(expected[index])) {
      return false;
    } else {
      allEqual = false;
      return true;
    }
  });
  return allEqual;
}

module.exports = {
  toEqualAtomRange: toEqualAtomRange,
  toEqualAtomRanges: toEqualAtomRanges
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGNoZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjOUIsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFxQixFQUFXO0FBQ3hELFNBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNyRTs7Ozs7Ozs7O0FBU0QsU0FBUyxpQkFBaUIsQ0FBQyxRQUE0QixFQUFXO0FBQ2hFLE1BQUksUUFBUSxHQUFHLElBQUksQ0FBQztBQUNwQixNQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUM3QixXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsTUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFLO0FBQ2pDLDZCQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNsQyxhQUFPLEtBQUssQ0FBQztLQUNkLE1BQU07QUFDTCxjQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ2pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRixDQUFDLENBQUM7QUFDSCxTQUFPLFFBQVEsQ0FBQztDQUNqQjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixtQkFBaUIsRUFBakIsaUJBQWlCO0NBQ2xCLENBQUMiLCJmaWxlIjoibWF0Y2hlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbi8qKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGEgc2V0IG9mIGN1c3RvbSBtYXRjaGVycyBmb3IgamFzbWluZSB0ZXN0aW5nLCBhcyBkZXNjcmliZWRcbiAqIGhlcmU6IGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8xLjMvaW50cm9kdWN0aW9uLmh0bWwjc2VjdGlvbi1Xcml0aW5nX2FfY3VzdG9tX21hdGNoZXIuXG4gKi9cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHR3byBSYW5nZXMgYXJlIGVxdWFsLiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBub3QgYmUgY2FsbGVkXG4gKiBkaXJlY3RseSwgYnV0IHJhdGhlciBhZGRlZCBhcyBhIEphc21pbmUgY3VzdG9tIG1hdGNoZXIuXG4gKiBAcGFyYW0gVGhlIGV4cGVjdGVkIHJlc3VsdCBmcm9tIHRoZSB0ZXN0LlxuICogQHRoaXMgQSBKYXNtaW5lTWF0Y2hlciBvYmplY3QuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBSYW5nZXMgYXJlIGVxdWFsLlxuICovXG5mdW5jdGlvbiB0b0VxdWFsQXRvbVJhbmdlKGV4cGVjdGVkOiA/YXRvbSRSYW5nZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISF0aGlzLmFjdHVhbCAmJiAhIWV4cGVjdGVkICYmIHRoaXMuYWN0dWFsLmlzRXF1YWwoZXhwZWN0ZWQpO1xufVxuXG4vKipcbiAqIFNhbWUgYXMgYHRvRXF1YWxBdG9tUmFuZ2VgIGJ1dCBmb3IgYW4gYXJyYXkgb2YgUmFuZ2VzLiBUaGlzIGZ1bmN0aW9uIHNob3VsZFxuICogbm90IGJlIGNhbGxlZCBkaXJlY3RseSwgYnV0IHJhdGhlciBhZGRlZCBhcyBhIEphc21pbmUgY3VzdG9tIG1hdGNoZXIuXG4gKiBAcGFyYW0gVGhlIGV4cGVjdGVkIHJlc3VsdCBmcm9tIHRoZSB0ZXN0LlxuICogQHRoaXMgQSBKYXNtaW5lTWF0Y2hlciBvYmplY3QuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBhcnJheSBvZiBSYW5nZXMgYXJlIGVxdWFsLlxuICovXG5mdW5jdGlvbiB0b0VxdWFsQXRvbVJhbmdlcyhleHBlY3RlZDogP0FycmF5PGF0b20kUmFuZ2U+KTogYm9vbGVhbiB7XG4gIGxldCBhbGxFcXVhbCA9IHRydWU7XG4gIGlmICghdGhpcy5hY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHRoaXMuYWN0dWFsLnNvbWUoKHJhbmdlLCBpbmRleCkgPT4ge1xuICAgIGludmFyaWFudChleHBlY3RlZCk7IC8vIFRlbGwgRmxvdyB0aGlzIGlzIGRlZmluaXRlbHkgbm9uLW51bGwgbm93LlxuICAgIGlmIChyYW5nZS5pc0VxdWFsKGV4cGVjdGVkW2luZGV4XSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWxsRXF1YWwgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhbGxFcXVhbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRvRXF1YWxBdG9tUmFuZ2UsXG4gIHRvRXF1YWxBdG9tUmFuZ2VzLFxufTtcbiJdfQ==