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
import {DebuggingActivation} from './debugging/DebuggingActivation';

export class Activation {
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable(
      new DebuggingActivation(),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

}
