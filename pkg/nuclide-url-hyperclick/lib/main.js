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
import invariant from 'assert';

import type {HyperclickProvider as HyperclickProviderType} from './HyperclickProvider';

class Activation {
  _disposables: CompositeDisposable;
  _hyperclickProvider: HyperclickProviderType;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  activate(): void {
  }

  getHyperclickProvider(): HyperclickProviderType {
    let provider = this._hyperclickProvider;
    if (provider == null) {
      const {HyperclickProvider} = require('./HyperclickProvider');
      this._hyperclickProvider = provider = new HyperclickProvider();
    }
    return provider;
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object): void {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

export function deactivate(): void {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function getHyperclickProvider(): HyperclickProviderType {
  invariant(activation);
  return activation.getHyperclickProvider();
}
