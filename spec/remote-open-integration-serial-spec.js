'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  activateAllPackages,
  deactivateAllPackages,
  jasmineIntegrationTestSetup,
} from './utils/integration-test-helpers';
import {copyBuildFixture} from '../pkg/nuclide-test-helpers';
import {setLocalProject} from '../pkg/commons-atom/testHelpers';
import nuclideUri from '../pkg/commons-node/nuclideUri';
import {checkOutput} from '../pkg/commons-node/process';
import {existingEditorForUri} from '../pkg/commons-atom/text-editor';

describe('Remote Open', () => {
  it('tests remote open', () => {
    let filePath;

    waitsForPromise(async () => {
      jasmineIntegrationTestSetup();
      await activateAllPackages();

      const projectPath = await copyBuildFixture('python_project_1', __dirname);
      setLocalProject(projectPath);
      filePath = nuclideUri.join(projectPath, 'Foo.py');
    });

    waitsForPromise(async () => {
      // Open file via remote atom command
      const remoteAtomCommand =
        nuclideUri.join(__dirname, '../pkg/nuclide-remote-atom-rpc/bin/atom');
      const result = await checkOutput(remoteAtomCommand, [filePath]);

      // Process should exit cleanly
      expect(result.exitCode).toEqual(0);
      expect(result.stderr).toEqual('');
      expect(result.stdout).toEqual('');
    });

    waitsFor('File should open up in short order', 10000, () => {
      return existingEditorForUri(filePath) != null;
    });

    runs(() => {
      deactivateAllPackages();
    });
  });
});
