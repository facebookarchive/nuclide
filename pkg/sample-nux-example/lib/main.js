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
import {
  CompositeDisposable,
  Disposable,
} from 'atom';

import type {NuxTourModel} from '../../nuclide-nux/lib/NuxModel';
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {RegisterNux} from '../../nuclide-nux/lib/main';

class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar: GetToolBar): void {
    const toolBar = getToolBar('nux-example-toolbar');
    toolBar.addButton({
      icon: 'mortar-board',
      callback: 'nux-example-toolbar:noop',
      tooltip: 'Example Nux Toolbar Item',
    });
    this._disposables.add(new Disposable(() => {
      toolBar.removeItems();
    }));
  }

  addDisposable(disposable: Disposable) {
    this._disposables.add(disposable);
  }
}

let activation: ?Activation = null;

export function activate() {
  if (activation == null) {
    activation = new Activation();
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function consumeToolBar(getToolBar: GetToolBar): void {
  invariant(activation != null);
  activation.consumeToolBar(getToolBar);
}

function generateTestNuxTour(
  identifier: string,
  numViews: number = 1,
): NuxTourModel {
  const nuxViewModel = {
    content: 'Content',
    isCustomContent: false,
    selector: '.tool-bar .icon-mortar-board',
    selectorFunction: null,
    position: 'auto',
    displayPredicate: null,
    completionPredicate: null,
    completed: false,
  };
  return {
    completed: false,
    id: identifier,
    nuxList: Array(numViews).fill(nuxViewModel),
    trigger: null,
  };
}

export function consumeRegisterNuxService(addNewNux: RegisterNux): Disposable {
  invariant(activation != null);
  const disposable = addNewNux(generateTestNuxTour('example-nux', 2));
  activation.addDisposable(disposable);
  return disposable;
}
