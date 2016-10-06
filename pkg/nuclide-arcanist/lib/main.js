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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomRegisterGrammar2;

function _commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar2 = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _ArcanistDiagnosticsProvider2;

function _ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider2 = require('./ArcanistDiagnosticsProvider');
}

var _ArcBuildSystem2;

function _ArcBuildSystem() {
  return _ArcBuildSystem2 = _interopRequireDefault(require('./ArcBuildSystem'));
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).DedupedBusySignalProviderBase();
    (0, (_commonsAtomRegisterGrammar2 || _commonsAtomRegisterGrammar()).default)('source.json', '.arcconfig');
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'setCwdApi',
    value: function setCwdApi(cwdApi) {
      this._cwdApi = cwdApi;
      if (this._buildSystem != null) {
        this._buildSystem.setCwdApi(cwdApi);
      }
    }
  }, {
    key: 'provideBusySignal',
    value: function provideBusySignal() {
      return this._busySignalProvider;
    }
  }, {
    key: 'provideDiagnostics',
    value: function provideDiagnostics() {
      var provider = new (_ArcanistDiagnosticsProvider2 || _ArcanistDiagnosticsProvider()).ArcanistDiagnosticsProvider(this._busySignalProvider);
      this._disposables.add(provider);
      return provider;
    }
  }, {
    key: 'consumeBuildSystemRegistry',
    value: function consumeBuildSystemRegistry(registry) {
      this._disposables.add(registry.register(this._getBuildSystem()));
    }
  }, {
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      this._disposables.add(api.registerOutputProvider({
        id: 'Arc Build',
        messages: this._getBuildSystem().getOutputMessages()
      }));
    }
  }, {
    key: 'consumeCwdApi',
    value: function consumeCwdApi(api) {
      this.setCwdApi(api);

      var pkg = this;
      this._disposables.add({
        dispose: function dispose() {
          pkg = null;
        }
      });
      return new (_atom2 || _atom()).Disposable(function () {
        if (pkg != null) {
          pkg.setCwdApi(null);
        }
      });
    }
  }, {
    key: '_getBuildSystem',
    value: function _getBuildSystem() {
      if (this._buildSystem == null) {
        var buildSystem = new (_ArcBuildSystem2 || _ArcBuildSystem()).default();
        if (this._cwdApi != null) {
          buildSystem.setCwdApi(this._cwdApi);
        }
        this._disposables.add(buildSystem);
        this._buildSystem = buildSystem;
      }
      return this._buildSystem;
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;