'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideWorkingSetsStore = provideWorkingSetsStore;

var _atom = require('atom');

var _WorkingSetsStore;

function _load_WorkingSetsStore() {
  return _WorkingSetsStore = require('./WorkingSetsStore');
}

var _WorkingSetsConfig;

function _load_WorkingSetsConfig() {
  return _WorkingSetsConfig = require('./WorkingSetsConfig');
}

var _PathsObserver;

function _load_PathsObserver() {
  return _PathsObserver = require('./PathsObserver');
}

class Activation {

  constructor() {
    this.workingSetsStore = new (_WorkingSetsStore || _load_WorkingSetsStore()).WorkingSetsStore();
    this._workingSetsConfig = new (_WorkingSetsConfig || _load_WorkingSetsConfig()).WorkingSetsConfig();
    this._disposables = new _atom.CompositeDisposable();

    this._disposables.add(this.workingSetsStore.onSaveDefinitions(definitions => {
      this._workingSetsConfig.setDefinitions(definitions);
    }));

    this._disposables.add(this._workingSetsConfig.observeDefinitions(definitions => {
      this.workingSetsStore.updateDefinitions(definitions);
    }));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:toggle-last-selected', this.workingSetsStore.toggleLastSelected.bind(this.workingSetsStore)));

    this._disposables.add(new (_PathsObserver || _load_PathsObserver()).PathsObserver(this.workingSetsStore));
  }

  deactivate() {
    this._disposables.dispose();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

let activation = null;

function activate() {
  if (activation != null) {
    return;
  }

  activation = new Activation();
}

function deactivate() {
  if (activation == null) {
    return;
  }

  activation.deactivate();
  activation = null;
}

function provideWorkingSetsStore() {
  if (!activation) {
    throw new Error('Was requested to provide service from a non-activated package');
  }

  return activation.workingSetsStore;
}