'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';

const NUX_NAMESPACE = 'nuclide-nux';
export const NUX_SAVED_STORE = `${NUX_NAMESPACE}.saved-nux-data-store`;
export const NUX_SAMPLE_OUTLINE_VIEW_TOUR = `${NUX_NAMESPACE}.outline-view-tour`;

class Activation {
  _disposables: CompositeDisposable;

  constructor(): void {
    this._disposables = new CompositeDisposable();
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(): void {
  activation = new Activation();
}

export function deactivate(): void {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
