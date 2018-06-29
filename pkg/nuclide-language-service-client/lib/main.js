/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observeTextEditors} from '../../nuclide-language-service/lib/FileEventHandlers';

// A dummy Atom package necessary for calling observeTextEditors() since
// nuclide-language-service is a Node package.
class Activation {
  _disposables: IDisposable;

  constructor() {
    this._disposables = new UniversalDisposable(observeTextEditors());
  }

  dispose() {
    this._disposables.dispose();
  }
}

createPackage(module.exports, Activation);
