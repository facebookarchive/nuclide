"use strict";

function _remoteTextBuffer() {
  const data = require("../lib/remote-text-buffer");

  _remoteTextBuffer = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('existingBufferForUri', () => {
  const file1 = '/tmp/file1.txt';
  it('should open an editor with the same buffer, if previously cached', async () => {
    const existingBuffer = (0, _remoteTextBuffer().existingBufferForUri)(file1);
    expect(existingBuffer).toBeUndefined();
    const secondFile1Buffer = (await atom.workspace.open(file1)).getBuffer();
    expect(secondFile1Buffer).toBeDefined();
    const bufferAfterCreation = (0, _remoteTextBuffer().existingBufferForUri)(file1);
    expect(bufferAfterCreation).toBeDefined();
  });
});
describe('bufferForUri', () => {
  const file1 = '/tmp/file1.txt';
  const file2 = '/tmp/file2.txt';
  let file1Buffer = null;
  beforeEach(() => {
    file1Buffer = (0, _remoteTextBuffer().bufferForUri)(file1);
  });
  it('should open an editor with the same buffer, if previously cached', async () => {
    const secondFile1Buffer = (await atom.workspace.open(file1)).getBuffer();
    expect(secondFile1Buffer).toBe(file1Buffer);
  });
  it('should return the same buffer after creating an editor for it', async () => {
    const file2Buffer = (await atom.workspace.open(file2)).getBuffer();
    expect((0, _remoteTextBuffer().bufferForUri)(file2)).toBe(file2Buffer);
  });
  it('should throw an error if remote connection not found', () => {
    const uri = 'nuclide://host/abc.txt';
    expect(() => (0, _remoteTextBuffer().bufferForUri)(uri)).toThrow(`ServerConnection cannot be found for uri: ${uri}`);
  });
});