Object.defineProperty(exports, '__esModule', {
  value: true
});

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

module.exports = Object.defineProperties({}, {
  USER: {
    // Get name of the user who starts this process, supports both *nix and Windows.

    get: function get() {
      var user = process.env['USER'] || process.env['USERNAME'];
      (0, _assert2['default'])(user != null);
      return user;
    },
    configurable: true,
    enumerable: true
  },
  HOME: {

    // Get home directory of the user who starts this process, supports both *nix and Windows.

    get: function get() {
      return process.env['HOME'] || process.env['USERPROFILE'];
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVudmlyb25tZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQVdzQixRQUFROzs7O0FBTzlCLE1BQU0sQ0FBQyxPQUFPLDJCQUFHLEVBWWhCO0FBVkssTUFBSTs7O1NBQUEsZUFBVztBQUNqQixVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUQsK0JBQVUsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3hCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7Ozs7QUFHRyxNQUFJOzs7O1NBQUEsZUFBWTtBQUNsQixhQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMxRDs7OztFQUNGLENBQUMiLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCB0eXBlIEVudmlyb25tZW50ID0ge1xuICBVU0VSOiBzdHJpbmc7XG4gIEhPTUU6IHN0cmluZztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBHZXQgbmFtZSBvZiB0aGUgdXNlciB3aG8gc3RhcnRzIHRoaXMgcHJvY2Vzcywgc3VwcG9ydHMgYm90aCAqbml4IGFuZCBXaW5kb3dzLlxuICBnZXQgVVNFUigpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVzZXIgPSBwcm9jZXNzLmVudlsnVVNFUiddIHx8IHByb2Nlc3MuZW52WydVU0VSTkFNRSddO1xuICAgIGludmFyaWFudCh1c2VyICE9IG51bGwpO1xuICAgIHJldHVybiB1c2VyO1xuICB9LFxuXG4gIC8vIEdldCBob21lIGRpcmVjdG9yeSBvZiB0aGUgdXNlciB3aG8gc3RhcnRzIHRoaXMgcHJvY2Vzcywgc3VwcG9ydHMgYm90aCAqbml4IGFuZCBXaW5kb3dzLlxuICBnZXQgSE9NRSgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnZbJ0hPTUUnXSB8fCBwcm9jZXNzLmVudlsnVVNFUlBST0ZJTEUnXTtcbiAgfSxcbn07XG4iXX0=