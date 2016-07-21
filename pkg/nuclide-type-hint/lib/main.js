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
exports.consumeTypehintProvider = consumeTypehintProvider;
exports.consumeDatatipService = consumeDatatipService;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var PACKAGE_NAME = 'nuclide-type-hint';

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    if (this.typeHintManager == null) {
      var TypeHintManager = require('./TypeHintManager');
      this.typeHintManager = new TypeHintManager();
    }
  }

  _createClass(Activation, [{
    key: 'consumeTypehintProvider',
    value: function consumeTypehintProvider(provider) {
      var _this = this;

      (0, (_assert2 || _assert()).default)(this.typeHintManager);
      this.typeHintManager.addProvider(provider);
      return new (_atom2 || _atom()).Disposable(function () {
        if (_this.typeHintManager != null) {
          _this.typeHintManager.removeProvider(provider);
        }
      });
    }
  }, {
    key: 'consumeDatatipService',
    value: function consumeDatatipService(service) {
      (0, (_assert2 || _assert()).default)(this.typeHintManager);
      var datatip = this.typeHintManager.datatip.bind(this.typeHintManager);
      var datatipProvider = {
        validForScope: function validForScope() {
          return true;
        },
        providerName: PACKAGE_NAME,
        inclusionPriority: 1,
        datatip: datatip
      };
      this.datatipService = service;
      service.addProvider(datatipProvider);
      var disposable = new (_atom2 || _atom()).Disposable(function () {
        return service.removeProvider(datatipProvider);
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  activation = new Activation(state);
}

function consumeTypehintProvider(provider) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.consumeTypehintProvider(provider);
}

function consumeDatatipService(service) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.consumeDatatipService(service);
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}