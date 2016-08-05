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
import type {HomeFragments} from './types';

import {CompositeDisposable, Disposable} from 'atom';
import featureConfig from '../../commons-atom/featureConfig';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import HomePaneItem from './HomePaneItem';
import Immutable from 'immutable';
import {React} from 'react-for-atom';
import Rx from 'rxjs';

let subscriptions: CompositeDisposable = (null: any);

// A stream of all of the fragments. This is essentially the state of our panel.
const allHomeFragmentsStream: Rx.BehaviorSubject<Immutable.Set<HomeFragments>> =
  new Rx.BehaviorSubject(Immutable.Set());

export function activate(state: ?Object): void {
  considerDisplayingHome();
  subscriptions = new CompositeDisposable();
}

export function setHomeFragments(homeFragments: HomeFragments): Disposable {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new Disposable(() => {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  const showHome = featureConfig.get('nuclide-home.showHome');
  if (showHome) {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-home:toggle',
      {visible: true},
    );
  }
}

export function deactivate(): void {
  allHomeFragmentsStream.next(Immutable.Set());
  subscriptions.dispose();
  subscriptions = (null: any);
}

export function consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
  subscriptions.add(
    api.registerFactory({
      id: 'nuclide-home',
      name: 'Home',
      iconName: 'home',
      toggleCommand: 'nuclide-home:toggle',
      defaultLocation: 'pane',
      create: () => (
        viewableFromReactElement(<HomePaneItem allHomeFragmentsStream={allHomeFragmentsStream} />)
      ),
      isInstance: item => item instanceof HomePaneItem,
    }),
  );
  considerDisplayingHome();
}
