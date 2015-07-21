'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var hyperclick: ?Hyperclick = null;
var {Disposable} = require('atom');

module.exports = {
  activate() {
    var Hyperclick = require('./Hyperclick');
    hyperclick = new Hyperclick();
  },

  deactivate() {
    if (hyperclick) {
      hyperclick.dispose();
      hyperclick = null;
    }
  },

  consumeProvider(provider: HyperclickProvider | Array<HyperclickProvider>): ?Disposable {
    if (hyperclick) {
      hyperclick.consumeProvider(provider);
      return new Disposable(() => {
        if (hyperclick) {
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
  observeTextEditor(): (textEditor: TextEditor) => void {
    return (textEditor: TextEditor) => {
      if (hyperclick) {
        hyperclick.observeTextEditor(textEditor);
      }
    };
  },
};
