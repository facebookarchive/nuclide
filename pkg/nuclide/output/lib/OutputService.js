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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk91dHB1dFNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWNxQixhQUFhO0FBR3JCLFdBSFEsYUFBYSxDQUdwQixRQUFrQixFQUFFOzBCQUhiLGFBQWE7O0FBSTlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0dBQzNCOztlQUxrQixhQUFhOztXQU9WLGdDQUFDLGNBQThCLEVBQW9CO0FBQ3ZFLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUM5RDs7O1NBVGtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ik91dHB1dFNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBDb21tYW5kcyBmcm9tICcuL0NvbW1hbmRzJztcbmltcG9ydCB0eXBlIHtPdXRwdXRQcm92aWRlcn0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE91dHB1dFNlcnZpY2Uge1xuICBfY29tbWFuZHM6IENvbW1hbmRzO1xuXG4gIGNvbnN0cnVjdG9yKGNvbW1hbmRzOiBDb21tYW5kcykge1xuICAgIHRoaXMuX2NvbW1hbmRzID0gY29tbWFuZHM7XG4gIH1cblxuICByZWdpc3Rlck91dHB1dFByb3ZpZGVyKG91dHB1dFByb3ZpZGVyOiBPdXRwdXRQcm92aWRlcik6IGF0b20kSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kcy5yZWdpc3Rlck91dHB1dFByb3ZpZGVyKG91dHB1dFByb3ZpZGVyKTtcbiAgfVxuXG59XG4iXX0=