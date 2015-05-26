'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideTextBuffer = require('../lib/NuclideTextBuffer');
var {RemoteFile, RemoteConnection} = require('nuclide-remote-connection');

describe('NuclideTextBuffer', () => {

  var buffer = null;
  var connection = null;
  var filePath = __filename;

  beforeEach(() => {
    connection = new RemoteConnection({});
    connection._config = {host: 'most.fb.com', port:9090};
    buffer = new NuclideTextBuffer(connection, {});
    // Disable file watch subscriptions, not needed here.
    buffer.subscribeToFile = () => {};
  });

  afterEach(() => {
    buffer = null;
    connection = null;
  });

  it('setPath creates a connection file', () => {
    buffer.setPath(filePath);
    expect(buffer.file instanceof RemoteFile).toBe(true);
    expect(buffer.file.getPath()).toBe('nuclide://most.fb.com:9090' + __filename);
  });
});
