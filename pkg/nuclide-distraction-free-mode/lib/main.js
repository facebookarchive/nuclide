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

var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeDistractionFreeModeProvider = consumeDistractionFreeModeProvider;
exports.consumeToolBar = consumeToolBar;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _DistractionFreeMode;

function _load_DistractionFreeMode() {
  return _DistractionFreeMode = require('./DistractionFreeMode');
}

var _BuiltinProviders;

function _load_BuiltinProviders() {
  return _BuiltinProviders = require('./BuiltinProviders');
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
    this._tunnelVision = new (_DistractionFreeMode || _load_DistractionFreeMode()).DistractionFreeMode(state);
    this._disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-distraction-free-mode:toggle', function () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('distraction-free-mode:toggle');
      _this._tunnelVision.toggleDistractionFreeMode();
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._tunnelVision.serialize();
    }
  }, {
    key: 'consumeDistractionFreeModeProvider',
    value: function consumeDistractionFreeModeProvider(providerOrList) {
      var _this2 = this;

      var providers = Array.isArray(providerOrList) ? providerOrList : [providerOrList];
      return new (_bind.apply((_atom || _load_atom()).CompositeDisposable, [null].concat(_toConsumableArray(providers.map(function (provider) {
        return _this2._tunnelVision.consumeDistractionFreeModeProvider(provider);
      })))))();
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-distraction-free-mode');
      toolBar.addSpacer({
        priority: 900
      });
      toolBar.addButton({
        icon: 'eye',
        callback: 'nuclide-distraction-free-mode:toggle',
        tooltip: 'Toggle Distraction-Free Mode',
        priority: 901
      });
      var disposable = new (_atom || _load_atom()).Disposable(function () {
        toolBar.removeItems();
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    for (var provider of (0, (_BuiltinProviders || _load_BuiltinProviders()).getBuiltinProviders)()) {
      activation.consumeDistractionFreeModeProvider(provider);
    }
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.serialize();
}

function consumeDistractionFreeModeProvider(provider) {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.consumeDistractionFreeModeProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, (_assert || _load_assert()).default)(activation != null);
  return activation.consumeToolBar(getToolBar);
}

// Should be the unique to all providers. Recommended to be the package name. This string is not
// user-facing.

// Serialize the restore state via an array of provider names.