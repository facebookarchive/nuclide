'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget, GadgetsService} from '../../nuclide-gadgets';

import {ExamplePaneItem} from './createExamplePaneItem';

export function consumeGadgetsService(api: GadgetsService): IDisposable {
  const disposable = api.registerGadget(((ExamplePaneItem: any): Gadget));
  // you could now keep a reference to `api` and use it to call, for example:
  // `api.showGadget('sample-gadget');`
  return disposable;
}
