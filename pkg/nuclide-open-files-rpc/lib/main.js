'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileVersion} from '../../nuclide-open-files-common/lib/rpc-types';

import {fileCache} from './OpenFilesService';

export const OPEN_FILES_SERVICE = 'OpenFilesService';

export function getBufferAtVersion(fileVersion: FileVersion): Promise<atom$TextBuffer> {
  return fileCache.getBufferAtVersion(fileVersion);
}
