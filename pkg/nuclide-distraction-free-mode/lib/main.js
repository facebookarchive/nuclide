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

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeDistractionFreeModeProvider = consumeDistractionFreeModeProvider;
exports.consumeToolBar = consumeToolBar;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _DistractionFreeMode2;

function _DistractionFreeMode() {
  return _DistractionFreeMode2 = require('./DistractionFreeMode');
}

var _BuiltinProviders2;

function _BuiltinProviders() {
  return _BuiltinProviders2 = require('./BuiltinProviders');
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._tunnelVision = new (_DistractionFreeMode2 || _DistractionFreeMode()).DistractionFreeMode(state);
    this._disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-distraction-free-mode:toggle', function () {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('distraction-free-mode:toggle');
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
      var disposable = new (_atom2 || _atom()).Disposable(function () {
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
    for (var provider of (0, (_BuiltinProviders2 || _BuiltinProviders()).getBuiltinProviders)()) {
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
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.serialize();
}

function consumeDistractionFreeModeProvider(provider) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeDistractionFreeModeProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeToolBar(getToolBar);
}

// Should be the unique to all providers. Recommended to be the package name. This string is not
// user-facing.

// Serialize the restore state via an array of provider names.