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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVudmlyb25tZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7QUFFOUIsTUFBTSxDQUFDLE9BQU8sMkJBQUcsRUFZaEI7QUFWSyxNQUFJOzs7U0FBQSxlQUFXO0FBQ2pCLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1RCwrQkFBVSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7QUFDeEIsYUFBTyxJQUFJLENBQUM7S0FDYjs7OztBQUdHLE1BQUk7Ozs7U0FBQSxlQUFHO0FBQ1QsYUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDMUQ7Ozs7RUFDRixDQUFDIiwiZmlsZSI6ImVudmlyb25tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gR2V0IG5hbWUgb2YgdGhlIHVzZXIgd2hvIHN0YXJ0cyB0aGlzIHByb2Nlc3MsIHN1cHBvcnRzIGJvdGggKm5peCBhbmQgV2luZG93cy5cbiAgZ2V0IFVTRVIoKTogc3RyaW5nIHtcbiAgICBjb25zdCB1c2VyID0gcHJvY2Vzcy5lbnZbJ1VTRVInXSB8fCBwcm9jZXNzLmVudlsnVVNFUk5BTUUnXTtcbiAgICBpbnZhcmlhbnQodXNlciAhPSBudWxsKTtcbiAgICByZXR1cm4gdXNlcjtcbiAgfSxcblxuICAvLyBHZXQgaG9tZSBkaXJlY3Rvcnkgb2YgdGhlIHVzZXIgd2hvIHN0YXJ0cyB0aGlzIHByb2Nlc3MsIHN1cHBvcnRzIGJvdGggKm5peCBhbmQgV2luZG93cy5cbiAgZ2V0IEhPTUUoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52WydIT01FJ10gfHwgcHJvY2Vzcy5lbnZbJ1VTRVJQUk9GSUxFJ107XG4gIH0sXG59O1xuIl19