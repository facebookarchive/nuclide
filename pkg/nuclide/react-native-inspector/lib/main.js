'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService} from '../../gadgets-interfaces';

export function consumeGadgetsService(api: GadgetsService): atom$IDisposable {
  const Inspector = require('./ui/Inspector');
  return api.registerGadget(Inspector);
}
