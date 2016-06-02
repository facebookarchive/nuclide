'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../pkg/nuclide-remote-uri';
import type {RemoteConnection} from '../../pkg/nuclide-remote-connection';

import {
  addRemoteProject,
  activateAllPackages,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  setLocalProject,
  startNuclideServer,
  stopNuclideServer,
} from '../../pkg/nuclide-integration-test-helpers';
import path from 'path';
import {join} from '../../pkg/nuclide-remote-uri';
import invariant from 'assert';

export type TestContext = {
  setProject(localProjectPath: string): Promise<void>;
  getProjectRelativePath(relativePath: string): NuclideUri;
};

class LocalTestContext {
  _projectPath: ?string;

  constructor() {
    this._projectPath = null;

    beforeEach(() => {
      waitsForPromise(async () => {
        jasmineIntegrationTestSetup();
        await activateAllPackages();
      });
    });

    afterEach(() => {
      deactivateAllPackages();
    });
  }

  async setProject(projectPath: string): Promise<void> {
    invariant(this._projectPath == null, 'Call setProject exactly once');
    setLocalProject(projectPath);
    this._projectPath = projectPath;
  }

  getProjectRelativePath(relativePath: string): NuclideUri {
    invariant(this._projectPath != null, 'Must call setProject first');
    return path.join(this._projectPath, relativePath);
  }
}

class RemoteTestContext {
  _localProjectPath: ?string;
  _remoteProjectPath: ?NuclideUri;
  _connection: ?RemoteConnection;

  constructor() {
    this._remoteProjectPath = null;

    beforeEach(() => {
      waitsForPromise(async () => {
        jasmineIntegrationTestSetup();
        await activateAllPackages();
      });
    });

    afterEach(() => {
      waitsForPromise(async () => {
        if (this._connection != null) {
          await stopNuclideServer(this._connection);
        }
        deactivateAllPackages();
      });
    });
  }

  async setProject(localProjectPath: string): Promise<void> {
    invariant(this._remoteProjectPath == null, 'Call setProject exactly once');
    await startNuclideServer();
    const connection = await addRemoteProject(localProjectPath);
    invariant(connection != null, 'connection was not established');
    this._connection = connection;
    this._remoteProjectPath = connection.getUriForInitialWorkingDirectory();
    invariant(this._remoteProjectPath != null, 'Remote project path not set');
  }

  getProjectRelativePath(relativePath: string): NuclideUri {
    invariant(this._remoteProjectPath != null, 'Must call setProject first');
    return join(this._remoteProjectPath, relativePath);
  }
}

// This function can be used in place of jasmine's describe.
// It will run the testDecription both locally and remotely.
// The provided testDescription must call context.setProject() exactly once
// and then use context.getProjectRelativePath() for relative file paths.
//
// Warning: running both tests in the same Atom instance may cause failures if the tests rely on
// some state that is not cleared. In that case, use describeRemote and describeLocal, below, in two
// separate integration test files.
export function describeRemotableTest(
  testName: string,
  testDescription: (context: TestContext) => void
): void {
  describeLocal(testName, testDescription);
  describeRemote(testName, testDescription);
}

export function describeRemote(
  testName: string,
  testDescription: (context: TestContext) => void,
): void {
  describe('Remote ' + testName, () => {
    testDescription(new RemoteTestContext());
  });
}

export function describeLocal(
  testName: string,
  testDescription: (context: TestContext) => void,
): void {
  describe('Local ' + testName, () => {
    testDescription(new LocalTestContext());
  });
}
