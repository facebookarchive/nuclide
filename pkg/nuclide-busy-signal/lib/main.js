'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _MessageStore;

function _load_MessageStore() {
  return _MessageStore = require('./MessageStore');
}

var _DedupedBusySignalProviderBase;

function _load_DedupedBusySignalProviderBase() {
  return _DedupedBusySignalProviderBase = require('./DedupedBusySignalProviderBase');
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = require('./StatusBarTile');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._messageStore = new (_MessageStore || _load_MessageStore()).MessageStore();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeStatusBar(statusBar) {
    const statusBarTile = this._statusBarTile = new (_StatusBarTile || _load_StatusBarTile()).StatusBarTile();
    statusBarTile.consumeMessageStream(this._messageStore.getMessageStream());
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (this._statusBarTile) {
        this._statusBarTile.dispose();
        this._statusBarTile = null;
      }
    });
    statusBarTile.consumeStatusBar(statusBar);
    this._disposables.add(disposable);
    return disposable;
  }

  consumeBusySignalProvider(provider) {
    const disposable = this._messageStore.consumeProvider(provider);
    this._disposables.add(disposable);
    return disposable;
  }

  provideBusySignal() {
    const busySignal = new (_DedupedBusySignalProviderBase || _load_DedupedBusySignalProviderBase()).DedupedBusySignalProviderBase();
    const disposable = this._messageStore.consumeProvider(busySignal);
    this._disposables.add(disposable);
    return {
      // TODO: clean up the backing provider to be more consistent.
      reportBusyWhile(message, f, options) {
        return busySignal.reportBusy(message, f, options);
      },
      reportBusy(message, options) {
        return busySignal.displayMessage(message, options);
      },
      dispose: () => {
        disposable.dispose();
        this._disposables.remove(disposable);
      }
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);