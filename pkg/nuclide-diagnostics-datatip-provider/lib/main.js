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
  Datatip,
  DatatipProvider,
  DatatipService,
} from '../../nuclide-datatip-interfaces';

import {
  CompositeDisposable,
  Disposable,
  Range,
} from 'atom';
import invariant from 'assert';
import {DiagnosticsDatatipComponent} from './DiagnosticsDatatipComponent';

const DATATIP_PACKAGE_NAME = 'nuclide-diagnostics-datatip';
const DEBUG = true;
export async function datatip(editor: TextEditor, position: atom$Point): Promise<?Datatip> {
  // TODO enable after GK check;
  if (DEBUG) {
    return null;
  }
  return {
    component: DiagnosticsDatatipComponent,
    pinnable: false,
    range: new Range(position, position),
  };
}

function getDatatipProvider(): DatatipProvider {
  return {
    // show this datatip for every type of file
    validForScope: (scope: string) => true,
    providerName: DATATIP_PACKAGE_NAME,
    inclusionPriority: 1,
    datatip,
  };
}

export function consumeDatatipService(service: DatatipService): IDisposable {
  const datatipProvider = getDatatipProvider();
  invariant(disposables);
  service.addProvider(datatipProvider);
  const disposable = new Disposable(() => service.removeProvider(datatipProvider));
  disposables.add(disposable);
  return disposable;
}

let disposables: ?CompositeDisposable = null;

export function activate(state: ?mixed): void {
  disposables = new CompositeDisposable();
}

export function deactivate(): void {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
}
