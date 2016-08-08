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

import unescapedUnicodeDatatip from './UnescapedUnicodeDatatip';

export default class UnicodeDatatipManager {
  _disposables: CompositeDisposable;
  datatipService: ?DatatipService;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    const datatipProvider: DatatipProvider = {
      datatip: (editor, position) => unescapedUnicodeDatatip(editor, position),
      validForScope: (scope: string) => true,
      providerName: 'nuclide-unicode-escapes',
      inclusionPriority: 1,
    };

    service.addProvider(datatipProvider);
    this.datatipService = service;
    const disposable = new Disposable(() => {
      service.removeProvider(datatipProvider);
      this.datatipService = null;
    });
    this._disposables.add(disposable);
    return disposable;
  }
}
