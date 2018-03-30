/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ConnectableObservable} from 'rxjs';
import type {VSAdapterExecutableInfo} from 'nuclide-debugger-common/types';
import type {ProcessMessage} from 'nuclide-commons/process';
import type {ProcessInfo} from 'nuclide-commons/process';

import {psTree} from 'nuclide-commons/process';
import {VsAdapterSpawner} from 'nuclide-debugger-common';

export class VsRawAdapterSpawnerService extends VsAdapterSpawner {
  spawnAdapter(
    adapter: VSAdapterExecutableInfo,
  ): ConnectableObservable<ProcessMessage> {
    return super.spawnAdapter(adapter);
  }

  write(input: string): Promise<void> {
    return super.write(input);
  }

  dispose(): Promise<void> {
    return super.dispose();
  }
}

export async function getProcessTree(): Promise<Array<ProcessInfo>> {
  return psTree();
}
