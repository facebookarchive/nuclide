var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var GadgetsService = (function () {
  function GadgetsService(commands) {
    _classCallCheck(this, GadgetsService);

    this._commands = commands;
  }

  _createClass(GadgetsService, [{
    key: 'destroyGadget',
    value: function destroyGadget(gadgetId) {
      this._commands.destroyGadget(gadgetId);
    }
  }, {
    key: 'registerGadget',
    value: function registerGadget(gadget) {
      var _this = this;

      this._commands.registerGadget(gadget);
      return new _atom.Disposable(function () {
        _this._commands.unregisterGadget(gadget.gadgetId);
      });
    }
  }, {
    key: 'showGadget',
    value: function showGadget(gadgetId) {
      this._commands.showGadget(gadgetId);
    }
  }]);

  return GadgetsService;
})();

module.exports = GadgetsService;