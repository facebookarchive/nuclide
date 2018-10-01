"use strict";

function _tools() {
  const data = require("../jest/e2e/tools");

  _tools = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
test('some random test', async () => {
  const tmpDir = (0, _tools().makeTempDir)('random_test');
  (0, _tools().writeFiles)(tmpDir, {
    'file1.js': 'module.exports = {}'
  });
  (0, _tools().openLocalDirectory)(tmpDir);
  const fileTree = await (0, _tools().openFileTree)();
  const matchingFiles = fileTree.findTextFilesWithNameMatching('file1.js');
  expect(matchingFiles).toHaveLength(1);
  await fileTree.previewFile('file1.js');
  const panes = (0, _tools().getAllPanes)();
  expect(panes.getAllTabNames()).toContain('file1.js');
});