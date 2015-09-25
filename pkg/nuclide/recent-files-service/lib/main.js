'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

var {
  CompositeDisposable,
  Disposable,
} = require('atom');

import type RecentFilesServiceType from './RecentFilesService';

class Activation {
  _subscriptions: CompositeDisposable;
  _service: RecentFilesServiceType;

  constructor(state: ?Object) {
    this._subscriptions = new CompositeDisposable();
    var RecentFilesService = require('./RecentFilesService');
    this._service = new RecentFilesService(state);
    this._subscriptions.add(new Disposable(() => {
      this._service.dispose();
    }));
  }

  getService(): RecentFilesServiceType {
    return this._service;
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

var activation: ?Activation = null;

module.exports = {

  activate(state: ?Object): void {
    if (activation == null) {
      activation = new Activation(state);
    }
  },

  provideRecentFilesService(): RecentFilesServiceType {
    invariant(activation);
    return activation.getService();
  },

  serialize(): Object {
    invariant(activation);
    return {
      filelist: activation.getService().getRecentFiles(),
    };
  },

  deactivate(): void {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

};
