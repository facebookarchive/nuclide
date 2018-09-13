/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+nuclide
 */

import {
  makeTempDir,
  openLocalDirectory,
  openFileTree,
  writeFiles,
  getAllPanes,
} from '../jest/e2e/tools';

test('some random test', async () => {
  const tmpDir = makeTempDir('random_test');
  writeFiles(tmpDir, {'file1.js': 'module.exports = {}'});
  openLocalDirectory(tmpDir);
  const fileTree = await openFileTree();
  const matchingFiles = fileTree.findTextFilesWithNameMatching('file1.js');
  expect(matchingFiles).toHaveLength(1);
  await fileTree.previewFile('file1.js');
  const panes = getAllPanes();
  expect(panes.getAllTabNames()).toContain('file1.js');
});
