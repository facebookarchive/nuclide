'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';

import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {Playground} from './Playground';
import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

let disposables: ?CompositeDisposable = null;

export function activate(): void {
  disposables = new CompositeDisposable();
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

export function consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
  invariant(disposables != null);
  disposables.add(
    api.registerFactory({
      id: 'sample-ui-playground',
      name: 'UI Playground',
      iconName: 'puzzle',
      toggleCommand: 'sample-ui-playground:toggle',
      defaultLocation: 'pane',
      create: () => viewableFromReactElement(<Playground />),
      isInstance: item => item instanceof Playground,
    }),
  );
  // Optionally return a disposable to clean up this package's state when gadgets goes away
}
