'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget, GadgetsService} from '../../nuclide-gadgets/lib/types';

import SettingsPaneItem from './SettingsPaneItem';

export function consumeGadgetsService(api: GadgetsService): IDisposable {
  const disposable = api.registerGadget(((SettingsPaneItem: any): Gadget));
  return disposable;
}
