'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileVersion} from './rpc-types';
import {FileCache} from './FileCache';
import {FileVersionNotifier} from './FileVersionNotifier';
import {trackOperationTiming} from '../../nuclide-analytics';

export {FileCache, FileVersionNotifier};

import invariant from 'assert';

export const OPEN_FILES_SERVICE = 'OpenFilesService';

export function getBufferAtVersion(fileVersion: FileVersion): Promise<?atom$TextBuffer> {
  return trackOperationTiming(
    'getBufferAtVersion',
    () => {
      invariant(
        fileVersion.notifier instanceof FileCache,
        'Don\'t call this from the Atom process');
      return (fileVersion.notifier: FileCache).getBufferAtVersion(fileVersion);
    });
}
