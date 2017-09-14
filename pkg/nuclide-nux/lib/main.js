'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideRegisterNuxService = provideRegisterNuxService;
exports.provideTriggerNuxService = provideTriggerNuxService;
exports.consumeSyncCompletedNuxService = consumeSyncCompletedNuxService;

var _atom = require('atom');

var _NuxManager;

function _load_NuxManager() {
  return _NuxManager = require('./NuxManager');
}

var _NuxStore;

function _load_NuxStore() {
  return _NuxStore = require('./NuxStore');
}

class Activation {

  constructor() {
    this._disposables = new _atom.CompositeDisposable();
    this._nuxStore = new (_NuxStore || _load_NuxStore()).NuxStore();
    this._nuxManager = new (_NuxManager || _load_NuxManager()).NuxManager(this._nuxStore, this._syncCompletedNux.bind(this));

    this._disposables.add(this._nuxStore);
    this._disposables.add(this._nuxManager);
  }

  dispose() {
    this._serializeAndPersist();
    this._disposables.dispose();
  }

  _serializeAndPersist() {
    this._nuxStore.serialize();
  }

  addNewNux(nux) {
    return this._nuxManager.addNewNux(nux);
  }

  tryTriggerNux(id) {
    this._nuxManager.tryTriggerNux(id);
  }

  setSyncCompletedNuxService(syncCompletedNuxService) {
    this._syncCompletedNuxService = syncCompletedNuxService;
  }

  _syncCompletedNux(id) {
    if (this._syncCompletedNuxService == null) {
      return;
    }
    this._syncCompletedNuxService(id);
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

let activation = null;

function activate() {
  if (activation == null) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function provideRegisterNuxService() {
  return nux => {
    if (activation == null) {
      throw new Error('An error occurred when instantiating the NUX package.');
    }
    if (nux == null) {
      throw new Error('Cannot register a "null" NuxTour.');
    }
    return activation.addNewNux(nux);
  };
}

function provideTriggerNuxService() {
  return id => {
    if (activation == null) {
      throw new Error('An error occurred when instantiating the NUX package.');
    }
    activation.tryTriggerNux(id);
  };
}

function consumeSyncCompletedNuxService(syncCompletedNuxService) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  activation.setSyncCompletedNuxService(syncCompletedNuxService);
}