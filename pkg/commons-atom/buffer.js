'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function observeBuffers(observeBuffer: (buffer: atom$TextBuffer) => mixed): IDisposable {
  atom.project.getBuffers().forEach(observeBuffer);
  return atom.project.onDidAddBuffer(observeBuffer);
}
