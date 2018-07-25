"use strict";

function _profileUpdates() {
  const data = require("../../src/configuration/profile-updates");

  _profileUpdates = function () {
    return data;
  };

  return data;
}

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
const vscode = {
  workspace: {
    onDidChangeConfiguration: jest.fn()
  }
};
jest.mock('vscode', () => vscode, {
  virtual: true
});
describe('profile-updates', () => {
  const defaultProfile = {
    address: 'localhost',
    username: 'fooser',
    ports: '100-110',
    folders: ['folder1', 'folder2'],
    privateKey: Promise.resolve('abc123'),
    authMethod: Promise.resolve('private-key'),
    deployServer: {
      node: 'node',
      installationPath: '/usr/bin/node',
      autoUpdate: true
    }
  };
  afterEach(() => {
    jest.clearAllMocks();
  }); // Helper for simulating configuration changes.

  function affectsConfiguration(sectionA, resourceA) {
    return {
      affectsConfiguration(sectionB, resourceB) {
        return sectionB === sectionA && resourceA === resourceB;
      }

    };
  }

  it('configurationChanged', () => {
    const disposeListener = {
      dispose: jest.fn()
    };
    vscode.workspace.onDidChangeConfiguration.mockReturnValue(disposeListener);
    let changes = 0; // Observe changes to the configuration of 'abc'. We'll look at `changes` to
    // determine if updates are correctly detected.

    const sub = (0, _profileUpdates().configurationChanged)('abc').subscribe(() => ++changes); // configurationChanged should have subscribed to configuration changes via
    // the vscode API we've mocked.

    expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled(); // Grab its listener function so we can simulate updates.

    const update = vscode.workspace.onDidChangeConfiguration.mock.calls[0][0]; // Initially, no chages should be detected.

    expect(changes).toBe(0); // Simulate an update to 'abc'.

    update(affectsConfiguration('abc')); // Makes sure we see the update.

    expect(changes).toBe(1); // Update an unrelated configuration.

    update(affectsConfiguration('foo')); // No update happens.

    expect(changes).toBe(1); // Update 'abc' again.

    update(affectsConfiguration('abc')); // Another change detected.

    expect(changes).toBe(2); // `onDidChangeConfiguration` returned a disposable to stop listening, which
    // should not have been called yet...

    expect(disposeListener.dispose).not.toHaveBeenCalled(); // ...but once we unsubscribe from `configurationChanged`, it should call
    // the disposable to stop listening for change events.

    sub.unsubscribe();
    expect(disposeListener.dispose).toHaveBeenCalled(); // Unsubscribing should not trigger new changes.

    expect(changes).toBe(2);
  });
  describe('updates', () => {
    function toProfileEntry(profile) {
      return [profile.hostname, profile];
    }

    const profile1 = Object.assign({}, defaultProfile, {
      hostname: 'host1'
    });
    const profile2 = Object.assign({}, defaultProfile, {
      hostname: 'host2'
    });
    const profile2b = Object.assign({}, defaultProfile, {
      username: 'user',
      hostname: 'host2'
    });
    const profile3 = Object.assign({}, defaultProfile, {
      hostname: 'host3'
    });
    const profile3b = Object.assign({}, defaultProfile, {
      ports: '100',
      hostname: 'host3'
    });
    const profile4 = Object.assign({}, defaultProfile, {
      hostname: 'host4'
    });
    const profile5 = Object.assign({}, defaultProfile, {
      hostname: 'host5'
    });
    const prev = new Map([profile1, profile2, profile3, profile5].map(toProfileEntry));
    const next = new Map([profile1, profile3b, profile2b, profile4].map(toProfileEntry));
    it('updateRemoved', async () => {
      const results = await (0, _profileUpdates().updateRemoved)(prev, next).toArray().toPromise();
      expect(results).toEqual([{
        kind: 'removed',
        hostname: profile5.hostname
      }]);
    });
    it('updateAdded', async () => {
      const results = await (0, _profileUpdates().updateAdded)(prev, next).toArray().toPromise();
      expect(results).toEqual([{
        kind: 'added',
        profile: profile4
      }]);
    });
    it('updateChanged', async () => {
      const results = await (0, _profileUpdates().updateChanged)(prev, next).toArray().toPromise();
      expect(results).toHaveLength(2);
      expect(results).toContainEqual({
        kind: 'removed',
        hostname: profile2.hostname
      });
      expect(results).toContainEqual({
        kind: 'added',
        profile: profile2b
      });
    });
  });
});