/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {HyperclickProvider} from './types';

import {Disposable} from 'atom';
import Hyperclick from './Hyperclick';
import SuggestionList from './SuggestionList';
import SuggestionListElement from './SuggestionListElement';

let hyperclick: ?Hyperclick = null;

export function activate() {
  hyperclick = new Hyperclick();
}

export function deactivate() {
  if (hyperclick != null) {
    hyperclick.dispose();
    hyperclick = null;
  }
}

export function consumeProvider(
  provider: HyperclickProvider | Array<HyperclickProvider>,
): ?Disposable {
  if (hyperclick != null) {
    hyperclick.consumeProvider(provider);
    return new Disposable(() => {
      if (hyperclick != null) {
        hyperclick.removeProvider(provider);
      }
    });
  }
}

/**
 * A TextEditor whose creation is announced via atom.workspace.observeTextEditors() will be
 * observed by default by hyperclick. However, if a TextEditor is created via some other means,
 * (such as a building block for a piece of UI), then it must be observed explicitly.
 */
export function observeTextEditor(): (textEditor: atom$TextEditor) => void {
  return (textEditor: atom$TextEditor) => {
    if (hyperclick != null) {
      hyperclick.observeTextEditor(textEditor);
    }
  };
}

export function provideHyperclickView(model: mixed): ?SuggestionListElement {
  if (!(model instanceof SuggestionList)) {
    return;
  }
  return new SuggestionListElement().initialize(model);
}
