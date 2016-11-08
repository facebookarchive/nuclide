'use strict';
'use babel';

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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('../../commons-atom/ProviderRegistry'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

var _refactorStore;

function _load_refactorStore() {
  return _refactorStore = require('./refactorStore');
}

var _refactorUIs;

function _load_refactorUIs() {
  return _refactorUIs = require('./refactorUIs');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Will be a union type when we add more


// Will be a union type when we add more
let Activation = class Activation {

  constructor() {
    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();

    this._store = (0, (_refactorStore || _load_refactorStore()).getStore)(this._providerRegistry);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_refactorUIs || _load_refactorUIs()).initRefactorUIs)(this._store), atom.commands.add('atom-workspace', 'nuclide-refactorizer:refactorize', () => {
      this._store.dispatch((_refactorActions || _load_refactorActions()).open('generic'));
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeRefactorProvider(provider) {
    this._providerRegistry.addProvider(provider);
    return new _atom.Disposable(() => {
      this._providerRegistry.removeProvider(provider);
    });
  }
};
exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];