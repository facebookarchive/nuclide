

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * This file contains a set of custom matchers for jasmine testing, which can be used
 * to get more detailed / useful diffs on various reults. These can be used in a test by doing:
 *
 * var {addMatchers} = require('nuclide-test-helpers');
 *
 * And then in a `beforeEach()`:
 *
 * ```
 * beforeEach(() => {
 *   addMatchers(this);
 * }
 * ```
 */

// We have to create an invariant function that is a lie because using invariant() with an
// instanceof check is the only way to convince Flow of the type of an unbound `this`.
var invariant = function invariant(condition) {};

var chalk = require('chalk');
var diff = require('diff');

/**
 * Do a recursive diff of two JSON objects. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the objects are identical.
 */
function diffJson(expected) {
  var parts = diff.diffJson(expected, this.actual);

  var _formatMessage = formatMessage(parts);

  var message = _formatMessage.message;
  var changes = _formatMessage.changes;

  invariant(this instanceof jasmine.Matchers);
  this.message = function () {
    return message;
  };
  return changes === 0;
}

/**
 * Do a line by line diff of two strings. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the strings are identical.
 */
function diffLines(expected) {
  var parts = diff.diffLines(expected, this.actual);

  var _formatMessage2 = formatMessage(parts);

  var message = _formatMessage2.message;
  var changes = _formatMessage2.changes;

  invariant(this instanceof jasmine.Matchers);
  this.message = function () {
    return message;
  };
  return changes === 0;
}

/**
 * Helper function that counts changes in the output from JsDiff, as well as
 * generates a colored message that shows diff output.
 * @param The output from JsDiff.
 * @returns On object containing the number of changes (added or removed parts),
 *   and a string containing the colored diff output.
 */
function formatMessage(parts) {
  var changes = 0,
      message = '';
  for (var part of parts) {
    var color = 'gray';
    if (part.added || part.removed) {
      ++changes;
      color = part.added ? 'green' : 'red';
    }
    message += chalk[color](part.value);
  }
  return { changes: changes, message: message };
}

function addMatchers(spec) {
  var matchersPrototype = {
    diffJson: diffJson,
    diffLines: diffLines
  };
  spec.addMatchers(matchersPrototype);
}

module.exports = {
  addMatchers: addMatchers,
  diffJson: diffJson,
  diffLines: diffLines
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGNoZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCQSxJQUFNLFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxTQUFTLEVBQWMsRUFBRSxDQUFDOztBQUU3QyxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7Ozs7Ozs7QUFlN0IsU0FBUyxRQUFRLENBQUMsUUFBZ0IsRUFBVztBQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O3VCQUN4QixhQUFhLENBQUMsS0FBSyxDQUFDOztNQUF4QyxPQUFPLGtCQUFQLE9BQU87TUFBRSxPQUFPLGtCQUFQLE9BQU87O0FBQ3ZCLFdBQVMsQ0FBQyxJQUFJLFlBQVksT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVDLE1BQUksQ0FBQyxPQUFPLEdBQUc7V0FBTSxPQUFPO0dBQUEsQ0FBQztBQUM3QixTQUFPLE9BQU8sS0FBSyxDQUFDLENBQUM7Q0FDdEI7Ozs7Ozs7OztBQVNELFNBQVMsU0FBUyxDQUFDLFFBQWdCLEVBQVc7QUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzt3QkFDekIsYUFBYSxDQUFDLEtBQUssQ0FBQzs7TUFBeEMsT0FBTyxtQkFBUCxPQUFPO01BQUUsT0FBTyxtQkFBUCxPQUFPOztBQUN2QixXQUFTLENBQUMsSUFBSSxZQUFZLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxNQUFJLENBQUMsT0FBTyxHQUFHO1dBQU0sT0FBTztHQUFBLENBQUM7QUFDN0IsU0FBTyxPQUFPLEtBQUssQ0FBQyxDQUFDO0NBQ3RCOzs7Ozs7Ozs7QUFTRCxTQUFTLGFBQWEsQ0FBQyxLQUFvQixFQUFzQztBQUMvRSxNQUFJLE9BQU8sR0FBRyxDQUFDO01BQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUM5QixPQUFLLElBQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN4QixRQUFJLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDbkIsUUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDOUIsUUFBRSxPQUFPLENBQUM7QUFDVixXQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQ3RDO0FBQ0QsV0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDckM7QUFDRCxTQUFPLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBRSxPQUFPLEVBQVAsT0FBTyxFQUFDLENBQUM7Q0FDM0I7O0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBaUIsRUFBRTtBQUN0QyxNQUFNLGlCQUFpQixHQUFHO0FBQ3hCLFlBQVEsRUFBUixRQUFRO0FBQ1IsYUFBUyxFQUFULFNBQVM7R0FDVixDQUFDO0FBQ0YsTUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3JDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixhQUFXLEVBQVgsV0FBVztBQUNYLFVBQVEsRUFBUixRQUFRO0FBQ1IsV0FBUyxFQUFULFNBQVM7Q0FDVixDQUFDIiwiZmlsZSI6Im1hdGNoZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLypcbiAqIFRoaXMgZmlsZSBjb250YWlucyBhIHNldCBvZiBjdXN0b20gbWF0Y2hlcnMgZm9yIGphc21pbmUgdGVzdGluZywgd2hpY2ggY2FuIGJlIHVzZWRcbiAqIHRvIGdldCBtb3JlIGRldGFpbGVkIC8gdXNlZnVsIGRpZmZzIG9uIHZhcmlvdXMgcmV1bHRzLiBUaGVzZSBjYW4gYmUgdXNlZCBpbiBhIHRlc3QgYnkgZG9pbmc6XG4gKlxuICogdmFyIHthZGRNYXRjaGVyc30gPSByZXF1aXJlKCdudWNsaWRlLXRlc3QtaGVscGVycycpO1xuICpcbiAqIEFuZCB0aGVuIGluIGEgYGJlZm9yZUVhY2goKWA6XG4gKlxuICogYGBgXG4gKiBiZWZvcmVFYWNoKCgpID0+IHtcbiAqICAgYWRkTWF0Y2hlcnModGhpcyk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuXG4vLyBXZSBoYXZlIHRvIGNyZWF0ZSBhbiBpbnZhcmlhbnQgZnVuY3Rpb24gdGhhdCBpcyBhIGxpZSBiZWNhdXNlIHVzaW5nIGludmFyaWFudCgpIHdpdGggYW5cbi8vIGluc3RhbmNlb2YgY2hlY2sgaXMgdGhlIG9ubHkgd2F5IHRvIGNvbnZpbmNlIEZsb3cgb2YgdGhlIHR5cGUgb2YgYW4gdW5ib3VuZCBgdGhpc2AuXG5jb25zdCBpbnZhcmlhbnQgPSAoY29uZGl0aW9uOiBib29sZWFuKSA9PiB7fTtcblxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpO1xuY29uc3QgZGlmZiA9IHJlcXVpcmUoJ2RpZmYnKTtcblxudHlwZSBDaGFuZ2UgPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHJlbW92ZWQ/OiBib29sZWFuO1xuICBhZGRlZD86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIERvIGEgcmVjdXJzaXZlIGRpZmYgb2YgdHdvIEpTT04gb2JqZWN0cy4gVGhpcyBmdW5jdGlvbiBzaG91bGQgbm90IGJlIGNhbGxlZFxuICogZGlyZWN0bHksIGJ1dCByYXRoZXIgYWRkZWQgYXMgYSBKYXNtaW5lIGN1c3RvbSBtYXRjaGVyLlxuICogQHBhcmFtIFRoZSBleHBlY3RlZCByZXN1bHQgZnJvbSB0aGUgdGVzdC5cbiAqIEB0aGlzIEEgSmFzbWluZU1hdGNoZXIgb2JqZWN0LlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb2JqZWN0cyBhcmUgaWRlbnRpY2FsLlxuICovXG5mdW5jdGlvbiBkaWZmSnNvbihleHBlY3RlZDogT2JqZWN0KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBhcnRzID0gZGlmZi5kaWZmSnNvbihleHBlY3RlZCwgdGhpcy5hY3R1YWwpO1xuICBjb25zdCB7bWVzc2FnZSwgY2hhbmdlc30gPSBmb3JtYXRNZXNzYWdlKHBhcnRzKTtcbiAgaW52YXJpYW50KHRoaXMgaW5zdGFuY2VvZiBqYXNtaW5lLk1hdGNoZXJzKTtcbiAgdGhpcy5tZXNzYWdlID0gKCkgPT4gbWVzc2FnZTtcbiAgcmV0dXJuIGNoYW5nZXMgPT09IDA7XG59XG5cbi8qKlxuICogRG8gYSBsaW5lIGJ5IGxpbmUgZGlmZiBvZiB0d28gc3RyaW5ncy4gVGhpcyBmdW5jdGlvbiBzaG91bGQgbm90IGJlIGNhbGxlZFxuICogZGlyZWN0bHksIGJ1dCByYXRoZXIgYWRkZWQgYXMgYSBKYXNtaW5lIGN1c3RvbSBtYXRjaGVyLlxuICogQHBhcmFtIFRoZSBleHBlY3RlZCByZXN1bHQgZnJvbSB0aGUgdGVzdC5cbiAqIEB0aGlzIEEgSmFzbWluZU1hdGNoZXIgb2JqZWN0LlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgc3RyaW5ncyBhcmUgaWRlbnRpY2FsLlxuICovXG5mdW5jdGlvbiBkaWZmTGluZXMoZXhwZWN0ZWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBwYXJ0cyA9IGRpZmYuZGlmZkxpbmVzKGV4cGVjdGVkLCB0aGlzLmFjdHVhbCk7XG4gIGNvbnN0IHttZXNzYWdlLCBjaGFuZ2VzfSA9IGZvcm1hdE1lc3NhZ2UocGFydHMpO1xuICBpbnZhcmlhbnQodGhpcyBpbnN0YW5jZW9mIGphc21pbmUuTWF0Y2hlcnMpO1xuICB0aGlzLm1lc3NhZ2UgPSAoKSA9PiBtZXNzYWdlO1xuICByZXR1cm4gY2hhbmdlcyA9PT0gMDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBjb3VudHMgY2hhbmdlcyBpbiB0aGUgb3V0cHV0IGZyb20gSnNEaWZmLCBhcyB3ZWxsIGFzXG4gKiBnZW5lcmF0ZXMgYSBjb2xvcmVkIG1lc3NhZ2UgdGhhdCBzaG93cyBkaWZmIG91dHB1dC5cbiAqIEBwYXJhbSBUaGUgb3V0cHV0IGZyb20gSnNEaWZmLlxuICogQHJldHVybnMgT24gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG51bWJlciBvZiBjaGFuZ2VzIChhZGRlZCBvciByZW1vdmVkIHBhcnRzKSxcbiAqICAgYW5kIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNvbG9yZWQgZGlmZiBvdXRwdXQuXG4gKi9cbmZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2UocGFydHM6IEFycmF5PENoYW5nZT4pOiB7Y2hhbmdlczogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmd9IHtcbiAgbGV0IGNoYW5nZXMgPSAwLCBtZXNzYWdlID0gJyc7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGxldCBjb2xvciA9ICdncmF5JztcbiAgICBpZiAocGFydC5hZGRlZCB8fCBwYXJ0LnJlbW92ZWQpIHtcbiAgICAgICsrY2hhbmdlcztcbiAgICAgIGNvbG9yID0gcGFydC5hZGRlZCA/ICdncmVlbicgOiAncmVkJztcbiAgICB9XG4gICAgbWVzc2FnZSArPSBjaGFsa1tjb2xvcl0ocGFydC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHtjaGFuZ2VzLCBtZXNzYWdlfTtcbn1cblxuZnVuY3Rpb24gYWRkTWF0Y2hlcnMoc3BlYzogSmFzbWluZVNwZWMpIHtcbiAgY29uc3QgbWF0Y2hlcnNQcm90b3R5cGUgPSB7XG4gICAgZGlmZkpzb24sXG4gICAgZGlmZkxpbmVzLFxuICB9O1xuICBzcGVjLmFkZE1hdGNoZXJzKG1hdGNoZXJzUHJvdG90eXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZE1hdGNoZXJzLFxuICBkaWZmSnNvbixcbiAgZGlmZkxpbmVzLFxufTtcbiJdfQ==