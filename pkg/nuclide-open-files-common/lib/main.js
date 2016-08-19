'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  AtomRange,
  FileVersion,
} from './rpc-types';

import invariant from 'assert';

// Workaround for flow
export function convertRange(range: atom$Range): AtomRange {
  return {
    start: range.start,
    end: range.end,
  };
}

export function getFileVersionOfBuffer(buffer: atom$TextBuffer): FileVersion {
  invariant(buffer.getPath() !== '');
  return {
    filePath: buffer.getPath(),
    version: buffer.changeCount,
  };
}

export function getFileVersionOfEditor(editor: atom$TextEditor): FileVersion {
  return getFileVersionOfBuffer(editor.getBuffer());
}
