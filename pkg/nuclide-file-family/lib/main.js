/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {FileFamilyProvider} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {BehaviorSubject} from 'rxjs';

class Activation {
  _disposables: UniversalDisposable;
  _providers: BehaviorSubject<Set<FileFamilyProvider>> = new BehaviorSubject(
    new Set(),
  );

  constructor() {
    this._disposables = new UniversalDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeFileFamilyProvider(provider: FileFamilyProvider): IDisposable {
    const newProviders = new Set(this._providers.getValue());
    newProviders.add(provider);
    this._providers.next(newProviders);

    return new UniversalDisposable(() => {
      const withoutProvider = new Set(this._providers.getValue());
      withoutProvider.delete(provider);
      this._providers.next(withoutProvider);
    });
  }
}

createPackage(module.exports, Activation);
