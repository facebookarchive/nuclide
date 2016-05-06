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
import type {HomeFragments} from './types';

export type {HomeFragments} from './types';

import {CompositeDisposable, Disposable} from 'atom';
import featureConfig from '../../nuclide-feature-config';
import Immutable from 'immutable';
import Rx from 'rxjs';

let subscriptions: CompositeDisposable = (null: any);
let gadgetsApi: ?GadgetsService = null;

// A stream of all of the fragments. This is essentially the state of our panel.
const allHomeFragmentsStream: Rx.BehaviorSubject<Immutable.Set<HomeFragments>> =
  new Rx.BehaviorSubject(Immutable.Set());

export function activate(state: ?Object): void {
  considerDisplayingHome();
  subscriptions = new CompositeDisposable();
  subscriptions.add(
    atom.commands.add('atom-workspace', 'nuclide-home:show-settings', () => {
      atom.workspace.open('atom://config/packages/nuclide');
    })
  );
}

export function setHomeFragments(homeFragments: HomeFragments): Disposable {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new Disposable(() => {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  if (gadgetsApi == null) {
    return;
  }
  const showHome = featureConfig.get('nuclide-home.showHome');
  if (showHome) {
    gadgetsApi.showGadget('nuclide-home');
  }
}

export function deactivate(): void {
  gadgetsApi = null;
  allHomeFragmentsStream.next(Immutable.Set());
  subscriptions.dispose();
  subscriptions = (null: any);
}

export function consumeGadgetsService(api: GadgetsService): void {
  const createHomePaneItem = require('./createHomePaneItem');
  gadgetsApi = api;
  const gadget = createHomePaneItem(allHomeFragmentsStream);
  subscriptions.add(api.registerGadget(gadget));
  considerDisplayingHome();
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  const priority = require('../../nuclide-commons').toolbar.farEndPriority(500);
  const toolBar = getToolBar('nuclide-home');
  toolBar.addSpacer({
    priority: priority - 1,
  });
  toolBar.addButton({
    icon: 'gear',
    callback: 'nuclide-home:show-settings',
    tooltip: 'Open Nuclide Settings',
    priority,
  });
  subscriptions.add(new Disposable(() => {
    toolBar.removeItems();
  }));
}
