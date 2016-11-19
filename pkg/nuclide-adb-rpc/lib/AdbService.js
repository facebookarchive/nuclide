'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ConnectableObservable} from 'rxjs';

import * as ADB from './ADB';

export function startServer(
  adbPath: NuclideUri,
): ConnectableObservable<string> {
  return ADB.startServer(adbPath);
}

export function getDeviceList(
  adbPath: NuclideUri,
): ConnectableObservable<Array<string>> {
  return ADB.getDeviceList(adbPath);
}
