'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DedupedBusySignalProviderBase = exports.BusySignalProviderBase = undefined;
exports.activate = activate;
exports.consumeStatusBar = consumeStatusBar;
exports.consumeBusySignalProvider = consumeBusySignalProvider;
exports.deactivate = deactivate;

var _atom = require('atom');

var _MessageStore;

function _load_MessageStore() {
  return _MessageStore = require('./MessageStore');
}

var _BusySignalProviderBase;

function _load_BusySignalProviderBase() {
  return _BusySignalProviderBase = require('./BusySignalProviderBase');
}

var _DedupedBusySignalProviderBase;

function _load_DedupedBusySignalProviderBase() {
  return _DedupedBusySignalProviderBase = require('./DedupedBusySignalProviderBase');
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = require('./StatusBarTile');
}

exports.BusySignalProviderBase = (_BusySignalProviderBase || _load_BusySignalProviderBase()).BusySignalProviderBase;
exports.DedupedBusySignalProviderBase = (_DedupedBusySignalProviderBase || _load_DedupedBusySignalProviderBase()).DedupedBusySignalProviderBase; /**
                                                                                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                  * All rights reserved.
                                                                                                                                                  *
                                                                                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                  * the root directory of this source tree.
                                                                                                                                                  *
                                                                                                                                                  * 
                                                                                                                                                  */

class Activation {

  constructor() {
    this._disposables = new _atom.CompositeDisposable();
    this._messageStore = new (_MessageStore || _load_MessageStore()).MessageStore();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeStatusBar(statusBar) {
    const statusBarTile = this._statusBarTile = new (_StatusBarTile || _load_StatusBarTile()).StatusBarTile();
    statusBarTile.consumeMessageStream(this._messageStore.getMessageStream());
    const disposable = new _atom.Disposable(() => {
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
}

let activation = null;

function activate(state) {
  deactivate();
  activation = new Activation();
}

function consumeStatusBar(statusBar) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeStatusBar(statusBar);
}

function consumeBusySignalProvider(provider) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeBusySignalProvider(provider);
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}