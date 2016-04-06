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

import {CompositeDisposable, Disposable} from 'atom';

import type RecentFilesServiceType from './RecentFilesService';

class Activation {
  _subscriptions: CompositeDisposable;
  _service: RecentFilesServiceType;

  constructor(state: ?Object) {
    this._subscriptions = new CompositeDisposable();
    const RecentFilesService = require('./RecentFilesService');
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

let activation: ?Activation = null;

export function activate(state: ?Object): void {
  if (activation == null) {
    activation = new Activation(state);
  }
}

export function provideRecentFilesService(): RecentFilesServiceType {
  invariant(activation);
  return activation.getService();
}

export function serialize(): Object {
  invariant(activation);
  return {
    filelist: activation.getService().getRecentFiles(),
  };
}

export function deactivate(): void {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
