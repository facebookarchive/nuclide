'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as PythonService from '../../nuclide-python-base';

import invariant from 'assert';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

async function getCompletions(editor: atom$TextEditor) {
  const src = editor.getPath();
  if (!src) {
    return null;
  }
  const cursor = editor.getLastCursor();

  const line = cursor.getBufferRow();
  const column = cursor.getBufferColumn();

  const service: ?PythonService = getServiceByNuclideUri('PythonService', src);
  invariant(service);

  return service
    .getCompletions(
      src,
      editor.getText(),
      line,
      column,
    );
}

module.exports = {
  getCompletions,
};
