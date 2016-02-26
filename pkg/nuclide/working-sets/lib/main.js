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


class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  deactivate(): void {
    this._disposables.dispose();
  }
}


let activation: ?Activation = null;

export function activate() {
  if (activation != null) {
    return;
  }

  activation = new Activation();
}

export function deactivate() {
  if (activation == null) {
    return;
  }

  activation.deactivate();
  activation = null;
}
