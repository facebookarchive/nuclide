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

import type CodeFormatManagerType from './CodeFormatManager';
import type {CodeFormatProvider} from './types';

let codeFormatManager: ?CodeFormatManagerType = null;

export function activate(state: ?any): void {
  const CodeFormatManager = require('./CodeFormatManager');
  codeFormatManager = new CodeFormatManager();
}

export function consumeProvider(provider: CodeFormatProvider) {
  invariant(codeFormatManager);
  codeFormatManager.addProvider(provider);
}

export function deactivate() {
  if (codeFormatManager) {
    codeFormatManager.dispose();
    codeFormatManager = null;
  }
}
