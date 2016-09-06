'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideUri from '../commons-node/nuclideUri';

export function observeBuffers(observeBuffer: (buffer: atom$TextBuffer) => mixed): IDisposable {
  atom.project.getBuffers()
    .filter(buffer => !nuclideUri.isBrokenDeserializedUri(buffer.getPath()))
    .forEach(observeBuffer);
  return atom.project.onDidAddBuffer(buffer => {
    if (!nuclideUri.isBrokenDeserializedUri(buffer.getPath())) {
      observeBuffer(buffer);
    }
  });
}
