'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.provideRecentFilesService = provideRecentFilesService;
exports.serialize = serialize;
exports.deactivate = deactivate;

var _atom = require('atom');

var _RecentFilesService;

function _load_RecentFilesService() {
  return _RecentFilesService = _interopRequireDefault(require('./RecentFilesService'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._subscriptions = new _atom.CompositeDisposable();
    this._service = new (_RecentFilesService || _load_RecentFilesService()).default(state);
    this._subscriptions.add(new _atom.Disposable(() => {
      this._service.dispose();
    }));
  }

  getService() {
    return this._service;
  }

  dispose() {
    this._subscriptions.dispose();
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

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function provideRecentFilesService() {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.getService();
}

function serialize() {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return {
    filelist: activation.getService().getRecentFiles()
  };
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}