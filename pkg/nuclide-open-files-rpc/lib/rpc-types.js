/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {AtomRange, FileVersion} from '../../nuclide-open-files-common/lib/rpc-types';

export type FileOpenEvent = {
  kind: 'open',
  fileVersion: FileVersion,
  contents: string,
};

// Used in debugging to verify that the server contents match the client
export type FileSyncEvent = {
  kind: 'sync',
  fileVersion: FileVersion,
  contents: string,
};

export type FileCloseEvent = {
  kind: 'close',
  fileVersion: FileVersion,
};

export type FileEditEvent = {
  kind: 'edit',
  fileVersion: FileVersion,
  oldRange: AtomRange,
  newRange: AtomRange,
  oldText: string,
  newText: string,
};

// TODO: Save Events?
export type FileEvent = FileOpenEvent | FileCloseEvent | FileEditEvent | FileSyncEvent;

export interface FileNotifier {
  onEvent(event: FileEvent): Promise<void>,
  dispose(): void,
}
