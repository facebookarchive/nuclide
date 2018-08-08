"use strict";

function vscode() {
  const data = _interopRequireWildcard(require("../__mocks__/vscode-harness"));

  vscode = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystem() {
  const data = require("../src/RemoteFileSystem");

  _RemoteFileSystem = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.mock('vscode', () => vscode(), {
  virtual: true
});
describe('RemoteFileSystem', () => {
  let fs;
  let server;
  beforeEach(() => {
    server = {
      disconnect: jest.fn()
    };
    fs = new (_RemoteFileSystem().RemoteFileSystem)('localhost', server);
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
    expect(fs.isDisposed()).toBe(true); // This will not call the listener again.

    fs.dispose();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(fs.isDisposed()).toBe(true);
  });
});