'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget, GadgetsService} from '../../nuclide-gadgets/lib/types';

import {ExamplePaneItem} from './createExamplePaneItem';
import invariant from 'assert';
import {CompositeDisposable} from 'atom';

let disposables: ?CompositeDisposable = null;

export function activate() {
  disposables = new CompositeDisposable();
}

export function consumeGadgetsService(api: GadgetsService): void {
  invariant(disposables != null);
  disposables.add(api.registerGadget(((ExamplePaneItem: any): Gadget)));
  // you could now keep a reference to `api` and use it to call, for example:
  // `api.showGadget('sample-gadget');`
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}
