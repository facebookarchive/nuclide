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

// This extra module enables adding spies during testing.
var track = undefined;
exports.track = track;
try {
  exports.track = track = require('../fb/analytics').track;
} catch (e) {
  exports.track = track = require('./analytics').track;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFZTyxJQUFJLEtBQUssWUFBQSxDQUFDOztBQUNqQixJQUFJO0FBQ0YsVUFGUyxLQUFLLEdBRWQsS0FBSyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssQ0FBQztDQUMxQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsVUFKUyxLQUFLLEdBSWQsS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDdEMiLCJmaWxlIjoidHJhY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyBUaGlzIGV4dHJhIG1vZHVsZSBlbmFibGVzIGFkZGluZyBzcGllcyBkdXJpbmcgdGVzdGluZy5cbmV4cG9ydCBsZXQgdHJhY2s7XG50cnkge1xuICB0cmFjayA9IHJlcXVpcmUoJy4uL2ZiL2FuYWx5dGljcycpLnRyYWNrO1xufSBjYXRjaCAoZSkge1xuICB0cmFjayA9IHJlcXVpcmUoJy4vYW5hbHl0aWNzJykudHJhY2s7XG59XG4iXX0=