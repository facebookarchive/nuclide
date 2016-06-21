'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideUri from '../../nuclide-remote-uri';
import fsPlus from 'fs-plus';
import temp from 'temp';
import LinkTreeManager from '../lib/LinkTreeManager';

const FIXTURES_PATH = nuclideUri.join(__dirname, 'fixtures');

temp.track();

function copyProject(projectInFixturesDirectory: string) {
  const tempDir = temp.mkdirSync('LinkTreeManager-spec');
  fsPlus.copySync(nuclideUri.join(__dirname, 'fixtures', projectInFixturesDirectory),
      tempDir);
  return tempDir;
}

// Disable buckd so it doesn't linger around after the test.
process.env.NO_BUCKD = '1';

describe('LinkTreeManager', () => {

  let linkTreeManager;
  const mockBuckProject = {
    getOwner(src) {
      return ['//test', '//test2'];
    },
    getPath() {
      return nuclideUri.join(__dirname, 'fixtures');
    },
    query(q) {
      return ['//testbin', '//testbin2'];
    },
  };

  beforeEach(() => {
    linkTreeManager = new LinkTreeManager();
  });

  it('correctly builds a link tree path given a source file path (mocked project)', () => {
    waitsForPromise(async () => {
      spyOn(linkTreeManager, '_getBuckProject').andReturn(mockBuckProject);

      const spy = spyOn(mockBuckProject, 'query').andReturn(['//testbin', '//testbin2']);
      const srcPath = nuclideUri.join(FIXTURES_PATH, 'test.py');
      const expectedPath = nuclideUri.join(FIXTURES_PATH, 'buck-out/gen/testbin#link-tree');

      let linkTreePath = await linkTreeManager.getLinkTreePath(srcPath);
      // rdeps query should be executed with the first owner found, and scoped to
      // the target of the source path's directory.
      expect(spy).toHaveBeenCalledWith(
        `kind(python_binary, rdeps(//fixtures:, owner(${srcPath})))`
      );
      // Properly resolve a link-tree path based on the source's firstly found
      // binary dependency.
      expect(linkTreePath).toBe(expectedPath);

      // Second call with the same source path should retrieve from cache and
      // not make a buck query.
      mockBuckProject.query.reset();
      linkTreePath = await linkTreeManager.getLinkTreePath(srcPath);
      expect(spy).not.toHaveBeenCalled();
      expect(linkTreePath).toBe(expectedPath);
    });
  });

  it('queries for python_unittest targets if no python_binary was found', () => {
    waitsForPromise(async () => {
      spyOn(linkTreeManager, '_getBuckProject').andReturn(mockBuckProject);

      // Return an empty array for results, in which case the manager should try
      // querying for python_unittest targets too.
      const spy = spyOn(mockBuckProject, 'query').andReturn([]);
      const srcPath = nuclideUri.join(FIXTURES_PATH, 'test.py');
      const linkTreePath = await linkTreeManager.getLinkTreePath(srcPath);
      expect(spy).toHaveBeenCalledWith(
        `kind(python_unittest, rdeps(//fixtures:, owner(${srcPath})))`
      );
      expect(linkTreePath).toBeNull;
    });
  });

  it('resolves a link tree path with a buck project\'s source file', () => {
    // Large timeout for buck to warm up.
    waitsForPromise({timeout: 30000}, async () => {
      const projectDir = copyProject('test-project');
      const srcPath = nuclideUri.join(projectDir, 'test1/test1.py');
      const linkTreePath = await linkTreeManager.getLinkTreePath(srcPath);
      expect(linkTreePath).toBe(
        nuclideUri.join(projectDir, 'buck-out/gen/test1/testbin1#link-tree')
      );
    });
  });

});
