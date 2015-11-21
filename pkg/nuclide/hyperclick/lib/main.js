'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider} from 'hyperclick-interfaces';
import type HyperclickType from './Hyperclick';

let hyperclick: ?HyperclickType = null;
import {Disposable} from 'atom';

module.exports = {
  activate() {
    const Hyperclick = require('./Hyperclick');
    hyperclick = new Hyperclick();
  },

  deactivate() {
    if (hyperclick != null) {
      hyperclick.dispose();
      hyperclick = null;
    }
  },

  consumeProvider(provider: HyperclickProvider | Array<HyperclickProvider>): ?Disposable {
    if (typeof provider.providerName !== 'string') {
      throw new Error('Missing "providerName" property for hyperclick provider.');
    }
    if (hyperclick != null) {
      hyperclick.consumeProvider(provider);
      return new Disposable(() => {
        if (hyperclick != null) {
          hyperclick.removeProvider(provider);
        }
      });
    }
  },

  /**
   * A TextEditor whose creation is announced via atom.workspace.observeTextEditors() will be
   * observed by default by hyperclick. However, if a TextEditor is created via some other means,
   * (such as a building block for a piece of UI), then it must be observed explicitly.
   */
  observeTextEditor(): (textEditor: atom$TextEditor) => void {
    return (textEditor: atom$TextEditor) => {
      if (hyperclick != null) {
        hyperclick.observeTextEditor(textEditor);
      }
    };
  },
};
