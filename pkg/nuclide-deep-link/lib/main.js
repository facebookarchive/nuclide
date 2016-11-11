'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

class Activation {
  _disposable: UniversalDisposable;

  constructor(state: ?Object): void {
    this._disposable = new UniversalDisposable();
  }

  dispose() {
    this._disposable.dispose();
  }
}

export default createPackage(Activation);
