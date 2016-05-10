'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  DatatipProvider,
  DatatipService,
} from '../../nuclide-datatip/lib/types';

import {
  CompositeDisposable,
  Disposable,
} from 'atom';
import invariant from 'assert';
import {datatip} from './SampleDatatip';

const PACKAGE_NAME = 'sample-datatip';

const datatipProvider: DatatipProvider = {
  // show the sample datatip for every type of file
  validForScope: (scope: string) => true,
  providerName: PACKAGE_NAME,
  inclusionPriority: 1,
  datatip,
};

class Activation {
  _disposables: CompositeDisposable;
  datatipService: ?DatatipService;

  constructor(state: ?mixed) {
    this._disposables = new CompositeDisposable();
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    service.addProvider(datatipProvider);
    this.datatipService = service;
    const disposable = new Disposable(() => {
      service.removeProvider(datatipProvider);
      this.datatipService = null;
    });
    this._disposables.add(disposable);
    return disposable;
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object): void {
  activation = new Activation(state);
}

export function consumeDatatipService(service: DatatipService): IDisposable {
  invariant(activation);
  return activation.consumeDatatipService(service);
}

export function deactivate(): void {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
