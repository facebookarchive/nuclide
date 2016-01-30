'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';

export class DatatipManager {
  _subscriptions: CompositeDisposable;

  constructor() {
    this._subscriptions = new CompositeDisposable();
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
