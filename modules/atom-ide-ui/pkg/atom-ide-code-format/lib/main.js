/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {CodeFormatProvider} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import CodeFormatManager from './CodeFormatManager';

class Activation {
  codeFormatManager: CodeFormatManager;

  constructor() {
    this.codeFormatManager = new CodeFormatManager();
  }

  consumeProvider(provider: CodeFormatProvider): IDisposable {
    return this.codeFormatManager.addProvider(provider);
  }

  dispose() {
    this.codeFormatManager.dispose();
  }
}

createPackage(module.exports, Activation);
