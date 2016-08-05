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

import createPackage from '../../commons-atom/createPackage';
import {PaneLocation} from './PaneLocation';
import {PanelLocation} from './PanelLocation';
import PanelLocationIds from './PanelLocationIds';
import {CompositeDisposable} from 'atom';

// This package doesn't actually serialize its own state. The reason is that we want to centralize
// that so that we can (eventually) associate them with profiles or workspace configurations.

class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.registerLocation({id: 'pane', create: () => new PaneLocation()}),
      ...PanelLocationIds.map(id => api.registerLocation({
        id,
        create: serializedState => new PanelLocation(id, serializedState || undefined),
      })),
    );
  }

}

export default createPackage(Activation);
