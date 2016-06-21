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

import {GK_NUX} from '../../nuclide-nux/lib/NuxManager';

import type {NuxTourModel} from '../../nuclide-nux/lib/NuxModel';
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {
  RegisterNux,
  TriggerNux,
} from '../../nuclide-nux/lib/main';

const SAMPLE_NUX_ID = 'sample-nux-example.sample-nux-id';

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
    const toolBarButtonView = toolBar.addButton({
      icon: 'mortar-board',
      callback: 'nux-example-toolbar:noop',
      tooltip: 'Example Nux Toolbar Item',
    });
    toolBarButtonView.element.classList.add('sample-nux-toolbar-button');
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
  id: string,
  numViews: number = 1,
): NuxTourModel {
  const getNuxViewModel = viewNumber => (
    {
      content: `Content NUX #${viewNumber}`,
      isCustomContent: false,
      selector: '.sample-nux-toolbar-button',
      selectorFunction: null,
      position: 'auto',
      completionPredicate: null,
    }
  );
  const nuxList = Array(numViews)
                    .fill() // Fill holes so map doesn't skip them
                    .map((_, index) => getNuxViewModel(index + 1));
  return {
    completed: false,
    id,
    nuxList,
    trigger: null,
    /* Add your own gatekeeper to control who the NUX is displayed to.
     * Use the global `GK_NUX` if you want the NUX to always appear.
     * See `nuclide-nux/lib/NuxModel.js` for more details.
     */
    gatekeeperID: GK_NUX,
  };
}

export function consumeRegisterNuxService(addNewNux: RegisterNux): Disposable {
  invariant(activation != null);
  const disposable = addNewNux(generateTestNuxTour(SAMPLE_NUX_ID, 2));
  activation.addDisposable(disposable);
  return disposable;
}

export function consumeTriggerNuxService(tryTriggerNux: TriggerNux): void {
  tryTriggerNux(SAMPLE_NUX_ID);
}
