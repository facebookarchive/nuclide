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

import type {HyperclickProvider} from './types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import createPackage from 'nuclide-commons-atom/createPackage';
import Hyperclick from './Hyperclick';

class Activation {
  _hyperclick: Hyperclick;
  _disposables: UniversalDisposable;

  constructor() {
    this._hyperclick = new Hyperclick();
    this._disposables = new UniversalDisposable(this._hyperclick);
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeProvider(
    provider: HyperclickProvider | Array<HyperclickProvider>,
  ): IDisposable {
    this._hyperclick.consumeProvider(provider);
    const disposable = new UniversalDisposable(() => {
      this._hyperclick.removeProvider(provider);
    });
    this._disposables.add(disposable);
    return disposable;
  }

  /**
   * A TextEditor whose creation is announced via atom.workspace.observeTextEditors() will be
   * observed by default by hyperclick. However, if a TextEditor is created via some other means,
   * (such as a building block for a piece of UI), then it must be observed explicitly.
   */
  observeTextEditor(): (textEditor: atom$TextEditor) => IDisposable {
    return (textEditor: atom$TextEditor) =>
      this._hyperclick.observeTextEditor(textEditor);
  }
}

createPackage(module.exports, Activation);
