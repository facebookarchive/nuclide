Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeDistractionFreeModeProvider = consumeDistractionFreeModeProvider;
exports.consumeToolBar = consumeToolBar;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _DistractionFreeMode = require('./DistractionFreeMode');

var _BuiltinProviders = require('./BuiltinProviders');

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
    this._tunnelVision = new _DistractionFreeMode.DistractionFreeMode(state);
    this._disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-distraction-free-mode:toggle', function () {
      (0, _nuclideAnalytics.track)('distraction-free-mode:toggle');
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
    value: function consumeDistractionFreeModeProvider(provider) {
      return this._tunnelVision.consumeDistractionFreeModeProvider(provider);
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-distraction-free-mode');
      toolBar.addButton({
        icon: 'eye',
        callback: 'nuclide-distraction-free-mode:toggle',
        tooltip: 'Toggle distraction-free mode',
        priority: 600
      });
      this._disposables.add(new _atom.Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    for (var provider of (0, _BuiltinProviders.getBuiltinProviders)()) {
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
  (0, _assert2['default'])(activation != null);
  return activation.serialize();
}

function consumeDistractionFreeModeProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeDistractionFreeModeProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, _assert2['default'])(activation != null);
  activation.consumeToolBar(getToolBar);
}

// Should be the unique to all providers. Recommended to be the package name.

// Serialize the restore state via an array of provider names.