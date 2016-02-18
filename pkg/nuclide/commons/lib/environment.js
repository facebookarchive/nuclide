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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVudmlyb25tZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7QUFFOUIsTUFBTSxDQUFDLE9BQU8sMkJBQUcsRUFZaEI7QUFWSyxNQUFJOzs7U0FBQSxlQUFXO0FBQ2pCLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1RCwrQkFBVSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7QUFDeEIsYUFBTyxJQUFJLENBQUM7S0FDYjs7OztBQUdHLE1BQUk7Ozs7U0FBQSxlQUFZO0FBQ2xCLGFBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzFEOzs7O0VBQ0YsQ0FBQyIsImZpbGUiOiJlbnZpcm9ubWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIEdldCBuYW1lIG9mIHRoZSB1c2VyIHdobyBzdGFydHMgdGhpcyBwcm9jZXNzLCBzdXBwb3J0cyBib3RoICpuaXggYW5kIFdpbmRvd3MuXG4gIGdldCBVU0VSKCk6IHN0cmluZyB7XG4gICAgY29uc3QgdXNlciA9IHByb2Nlc3MuZW52WydVU0VSJ10gfHwgcHJvY2Vzcy5lbnZbJ1VTRVJOQU1FJ107XG4gICAgaW52YXJpYW50KHVzZXIgIT0gbnVsbCk7XG4gICAgcmV0dXJuIHVzZXI7XG4gIH0sXG5cbiAgLy8gR2V0IGhvbWUgZGlyZWN0b3J5IG9mIHRoZSB1c2VyIHdobyBzdGFydHMgdGhpcyBwcm9jZXNzLCBzdXBwb3J0cyBib3RoICpuaXggYW5kIFdpbmRvd3MuXG4gIGdldCBIT01FKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiBwcm9jZXNzLmVudlsnSE9NRSddIHx8IHByb2Nlc3MuZW52WydVU0VSUFJPRklMRSddO1xuICB9LFxufTtcbiJdfQ==