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

var _atom = require('atom');

var OutputService = (function () {
  function OutputService(commands) {
    _classCallCheck(this, OutputService);

    this._commands = commands;
  }

  _createClass(OutputService, [{
    key: 'registerOutputProvider',
    value: function registerOutputProvider(outputProvider) {
      var _this = this;

      this._commands.registerOutputProvider(outputProvider);
      return new _atom.Disposable(function () {
        _this._commands.removeSource(outputProvider.source);
      });
    }
  }]);

  return OutputService;
})();

exports['default'] = OutputService;
module.exports = exports['default'];