'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideSideBarService} from '../../nuclide-side-bar';

import {CompositeDisposable, Disposable} from 'atom';
import SampleSideBarClientComponent from './SampleSideBarClientComponent';

const VIEW_ID = 'sample-side-bar-client';

let disposables;

export function activate() {
  disposables = new CompositeDisposable();
}

export function consumeNuclideSideBar(sidebar: NuclideSideBarService): void {
  sidebar.registerView({
    getComponent() { return SampleSideBarClientComponent; },
    onDidShow() {},
    title: 'Sample Side Bar Client',
    toggleCommand: 'nuclide-sample-side-bar-client:toggle',
    viewId: VIEW_ID,
  });

  disposables.add(new Disposable(() => {
    sidebar.destroyView(VIEW_ID);
  }));
}

export function deactivate() {
  disposables.dispose();
}
