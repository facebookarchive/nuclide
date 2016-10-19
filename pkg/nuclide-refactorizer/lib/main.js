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

/*
 * WARNING: This package is still experimental and in early development. Use it at your own risk.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsAtomProviderRegistry;

function _load_commonsAtomProviderRegistry() {
  return _commonsAtomProviderRegistry = _interopRequireDefault(require('../../commons-atom/ProviderRegistry'));
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

var _refactorStore;

function _load_refactorStore() {
  return _refactorStore = require('./refactorStore');
}

var _componentsMainRefactorComponent;

function _load_componentsMainRefactorComponent() {
  return _componentsMainRefactorComponent = require('./components/MainRefactorComponent');
}

// Will be a union type when we add more

// Will be a union type when we add more

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._providerRegistry = new (_commonsAtomProviderRegistry || _load_commonsAtomProviderRegistry()).default();

    this._store = (0, (_refactorStore || _load_refactorStore()).getStore)(this._providerRegistry);

    var panel = null;
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._store.subscribe(function () {
      var state = _this._store.getState();
      if (state.type === 'open') {
        if (panel == null) {
          var element = document.createElement('div');
          panel = atom.workspace.addModalPanel({ item: element });
        }
        (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_componentsMainRefactorComponent || _load_componentsMainRefactorComponent()).MainRefactorComponent, {
          appState: state,
          store: _this._store
        }), panel.getItem());
      } else {
        if (panel != null) {
          (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(panel.getItem());
          panel.destroy();
          panel = null;
        }
      }
    }), atom.commands.add('atom-workspace', 'nuclide-refactorizer:refactorize', function () {
      _this._store.dispatch((_refactorActions || _load_refactorActions()).open());
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeRefactorProvider',
    value: function consumeRefactorProvider(provider) {
      var _this2 = this;

      this._providerRegistry.addProvider(provider);
      return new (_atom || _load_atom()).Disposable(function () {
        _this2._providerRegistry.removeProvider(provider);
      });
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;