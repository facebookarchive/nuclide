/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */
import * as vscode from '../__mocks__/vscode-harness';

jest.mock('vscode', () => vscode, {virtual: true});

import {RemoteFileSystem} from '../src/RemoteFileSystem';

describe('RemoteFileSystem', () => {
  let fs: RemoteFileSystem;
  let server;

  beforeEach(() => {
    server = {
      disconnect: jest.fn(),
    };
    fs = new RemoteFileSystem('localhost', (server: any));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getServer', () => {
    expect(fs.getServer()).toBe(server);
  });

  it('dispose, isDisposed, onDisposed', () => {
    const listener = jest.fn();
    expect(fs.isDisposed()).toBe(false);

    fs.onDisposed(listener);
    fs.dispose();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(server.disconnect).toHaveBeenCalled();
    expect(fs.isDisposed()).toBe(true);

    // This will not call the listener again.
    fs.dispose();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(fs.isDisposed()).toBe(true);
  });
});
