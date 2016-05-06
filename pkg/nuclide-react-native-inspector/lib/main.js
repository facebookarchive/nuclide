'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService} from '../../nuclide-gadgets';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';

let disposables: ?CompositeDisposable = null;

export function activate(): void {
  disposables = new CompositeDisposable();
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

export function consumeGadgetsService(api: GadgetsService): void {
  const Inspector = require('./ui/Inspector');
  invariant(disposables != null);
  disposables.add(api.registerGadget(Inspector));
}
