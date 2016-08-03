'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type CodeFormatManagerType from './CodeFormatManager';
import type {CodeFormatProvider} from './types';

import invariant from 'assert';
import CodeFormatManager from './CodeFormatManager';

let codeFormatManager: ?CodeFormatManagerType = null;

export function activate(state: ?any): void {
  codeFormatManager = new CodeFormatManager();
}

export function consumeProvider(provider: CodeFormatProvider) {
  invariant(codeFormatManager != null);
  codeFormatManager.addProvider(provider);
}

export function deactivate() {
  invariant(codeFormatManager != null);
  codeFormatManager.dispose();
  codeFormatManager = null;
}
