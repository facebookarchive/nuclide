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
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';

import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {CompositeDisposable, Disposable} from 'atom';
import {React} from 'react-for-atom';
import SettingsPaneItem from './SettingsPaneItem';

let subscriptions: CompositeDisposable = (null: any);

export function activate(state: ?Object): void {
  subscriptions = new CompositeDisposable();
}

export function deactivate(): void {
  subscriptions.dispose();
  subscriptions = (null: any);
}

export function consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
  subscriptions.add(
    api.registerFactory({
      id: 'nuclide-settings',
      name: 'Nuclide Settings',
      toggleCommand: 'nuclide-settings:toggle',
      defaultLocation: 'pane',
      create: () => viewableFromReactElement(<SettingsPaneItem />),
      isInstance: item => item instanceof SettingsPaneItem,
    }),
  );
}

export function consumeToolBar(getToolBar: GetToolBar): IDisposable {
  const toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: -501,
  });
  toolBar.addButton({
    icon: 'gear',
    callback: 'nuclide-settings:toggle',
    tooltip: 'Open Nuclide Settings',
    priority: -500,
  });
  const disposable = new Disposable(() => { toolBar.removeItems(); });
  subscriptions.add(disposable);
  return disposable;
}
