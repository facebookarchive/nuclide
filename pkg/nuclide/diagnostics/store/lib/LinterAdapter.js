'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

type LinterMessage = {
  type: 'Error' | 'Warning',
  text: string,
  filePath: NuclideUri,
  range: atom$Range,
};

export type LinterProvider = {
  // providerName is an extension to the current linter api
  providerName?: string;
  grammarScopes: Array<string>;
  scope: 'file' | 'project';
  lintOnFly: bool;
  lint: (textEditor: TextEditor) => Promise<Array<LinterMessage>>;
};

var {Disposable} = require('atom');

// TODO implement
class LinterAdapter {
  constructor(provider: LinterProvider) {
  }

  onMessageUpdate(callback: MessageUpdateCallback): atom$Disposable {
    return new Disposable(() => {});
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): atom$Disposable {
    // no-op; we don't publish invalidations
    return new Disposable(() => {});
  }

  dispose() {
  }
}

module.exports = LinterAdapter;
