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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var OutputService = (function () {
  function OutputService(commands) {
    _classCallCheck(this, OutputService);

    this._commands = commands;
  }

  _createClass(OutputService, [{
    key: 'registerOutputProvider',
    value: function registerOutputProvider(outputProvider) {
      return this._commands.registerOutputProvider(outputProvider);
    }
  }]);

  return OutputService;
})();

exports['default'] = OutputService;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk91dHB1dFNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWNxQixhQUFhO0FBR3JCLFdBSFEsYUFBYSxDQUdwQixRQUFrQixFQUFFOzBCQUhiLGFBQWE7O0FBSTlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0dBQzNCOztlQUxrQixhQUFhOztXQU9WLGdDQUFDLGNBQThCLEVBQWU7QUFDbEUsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzlEOzs7U0FUa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiT3V0cHV0U2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IHR5cGUge091dHB1dFByb3ZpZGVyfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3V0cHV0U2VydmljZSB7XG4gIF9jb21tYW5kczogQ29tbWFuZHM7XG5cbiAgY29uc3RydWN0b3IoY29tbWFuZHM6IENvbW1hbmRzKSB7XG4gICAgdGhpcy5fY29tbWFuZHMgPSBjb21tYW5kcztcbiAgfVxuXG4gIHJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIob3V0cHV0UHJvdmlkZXI6IE91dHB1dFByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kcy5yZWdpc3Rlck91dHB1dFByb3ZpZGVyKG91dHB1dFByb3ZpZGVyKTtcbiAgfVxuXG59XG4iXX0=