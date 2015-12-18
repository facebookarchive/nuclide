'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import NuclideTextBuffer from '../lib/NuclideTextBuffer';
import {RemoteFile, RemoteConnection} from '../../remote-connection';

describe('NuclideTextBuffer', () => {

  let buffer: NuclideTextBuffer = (null: any);
  let connection = null;
  const filePath = __filename;

  beforeEach(() => {
    connection = new RemoteConnection({host: 'most.fb.com', port:9090, cwd: '/'});
    // Mock watcher service handlers registry.
    // $FlowFixMe override instance method.
    connection._addHandlersForEntry = () => {};
    buffer = new NuclideTextBuffer(connection, {});
    // Disable file watch subscriptions, not needed here.
    // $FlowFixMe override instance method.
    buffer.subscribeToFile = () => {};
  });

  it('setPath creates a connection file', () => {
    buffer.setPath(filePath);
    expect(buffer.file instanceof RemoteFile).toBe(true);
    invariant(buffer.file);
    expect(buffer.file.getPath()).toBe('nuclide://most.fb.com:9090' + __filename);
  });
});
