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
import {ExampleGadgetA} from './ExampleGadgetA';
import {ExampleGadgetB} from './ExampleGadgetB';
import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

let disposables: ?CompositeDisposable = null;

export function activate() {
  disposables = new CompositeDisposable();
}

// This example shows two different ways to create a gadget: ExampleGadgetA stores its state in a
// separate model object while ExampleGadgetB stores its state in a React element.

export function consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
  invariant(disposables != null);
  disposables.add(
    api.registerFactory({
      id: 'example-gadget-a',
      name: 'Example Gadget A',
      iconName: 'telescope',
      toggleCommand: 'toggle-example-gadget-a',
      defaultLocation: 'right-panel',
      create: () => new ExampleGadgetA(),
      isInstance: item => item instanceof ExampleGadgetA,
    }),
    api.registerFactory({
      id: 'example-gadget-b',
      name: 'Example Gadget B',
      iconName: 'telescope',
      toggleCommand: 'toggle-example-gadget-b',
      defaultLocation: 'right-panel',
      create: () => viewableFromReactElement(<ExampleGadgetB />),
      isInstance: item => item instanceof ExampleGadgetB,
    }),
  );
}

export function deserializeExampleGadgetA() {
  return new ExampleGadgetA();
}

export function deserializeExampleGadgetB() {
  return viewableFromReactElement(<ExampleGadgetB />);
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}
