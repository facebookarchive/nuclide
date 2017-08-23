'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class QuickOpenProviderRegistry {

  constructor() {
    this._emitter = new _atom.Emitter();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._directoryProviders = new Map();
    this._globalProviders = new Map();
  }

  getProviders() {
    return [...this._globalProviders.values(), ...this._directoryProviders.values()];
  }

  getGlobalProviders() {
    return [...this._globalProviders.values()];
  }

  getDirectoryProviders() {
    return [...this._directoryProviders.values()];
  }

  getProviderByName(serviceName) {
    return this._globalProviders.get(serviceName) || this._directoryProviders.get(serviceName);
  }

  getGlobalProviderByName(serviceName) {
    return this._globalProviders.get(serviceName);
  }

  getDirectoryProviderByName(serviceName) {
    return this._directoryProviders.get(serviceName);
  }

  isProviderGlobal(serviceName) {
    return this._globalProviders.has(serviceName);
  }

  observeProviders(callback) {
    for (const provider of this.getProviders()) {
      callback(provider);
    }
    return this.onDidAddProvider(callback);
  }

  onDidAddProvider(callback) {
    return this._emitter.on('did-add-provider', callback);
  }

  onDidRemoveProvider(callback) {
    return this._emitter.on('did-remove-provider', callback);
  }

  addProvider(service) {
    if (service.providerType === 'GLOBAL') {
      this._globalProviders.set(service.name, service);
    } else {
      this._directoryProviders.set(service.name, service);
    }
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (service.providerType === 'GLOBAL') {
        this._globalProviders.delete(service.name);
      } else {
        this._directoryProviders.delete(service.name);
      }
      this._emitter.emit('did-remove-provider', service);
    });
    this._subscriptions.add(disposable);
    this._emitter.emit('did-add-provider', service);

    return disposable;
  }

  dispose() {
    this._emitter.dispose();
    this._subscriptions.dispose();
  }
}
exports.default = QuickOpenProviderRegistry; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */