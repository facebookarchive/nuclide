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

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomRegisterGrammar;

function _load_commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _ArcanistDiagnosticsProvider;

function _load_ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider = require('./ArcanistDiagnosticsProvider');
}

var _ArcBuildSystem;

function _load_ArcBuildSystem() {
  return _ArcBuildSystem = _interopRequireDefault(require('./ArcBuildSystem'));
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
    (0, (_commonsAtomRegisterGrammar || _load_commonsAtomRegisterGrammar()).default)('source.json', '.arcconfig');
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
      var provider = new (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).ArcanistDiagnosticsProvider(this._busySignalProvider);
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
      return new (_atom || _load_atom()).Disposable(function () {
        if (pkg != null) {
          pkg.setCwdApi(null);
        }
      });
    }
  }, {
    key: '_getBuildSystem',
    value: function _getBuildSystem() {
      if (this._buildSystem == null) {
        var buildSystem = new (_ArcBuildSystem || _load_ArcBuildSystem()).default();
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

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;