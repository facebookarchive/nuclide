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

import createPackage from 'nuclide-commons-atom/createPackage';
import CodeHighlightManager from './CodeHighlightManager';

export type CodeHighlightProvider = {
  highlight(
    editor: atom$TextEditor,
    bufferPosition: atom$Point,
  ): Promise<?Array<atom$Range>>,
  inclusionPriority: number,
  selector: string,
};

class Activation {
  _codeHighlightManager: CodeHighlightManager;

  constructor() {
    this._codeHighlightManager = new CodeHighlightManager();
  }

  dispose() {
    this._codeHighlightManager.dispose();
  }

  addProvider(provider: CodeHighlightProvider): IDisposable {
    return this._codeHighlightManager.addProvider(provider);
  }
}

createPackage(module.exports, Activation);
