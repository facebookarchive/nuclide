'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileEvent} from './rpc-types';

import {FileCache} from './FileCache';

export const fileCache: FileCache = new FileCache();

export async function initialize(): Promise<FileNotifier> {
  fileCache.dispose();
  return new FileNotifier();
}

export class FileNotifier {
  async onEvent(event: FileEvent): Promise<void> {
    fileCache.onEvent(event);
  }
  dispose(): void {
    fileCache.dispose();
  }
}
