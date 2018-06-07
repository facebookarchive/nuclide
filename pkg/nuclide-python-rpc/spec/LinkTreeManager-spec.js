/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import nuclideUri from 'nuclide-commons/nuclideUri';
import * as BuckService from '../../nuclide-buck-rpc';
import LinkTreeManager from '../lib/LinkTreeManager';
import {copyBuildFixture} from '../../nuclide-test-helpers';

// Disable buckd so it doesn't linger around after the test.
process.env.NO_BUCKD = '1';

describe('LinkTreeManager', () => {
  let linkTreeManager: LinkTreeManager = (null: any);
  let projectDir: string = (null: any);

  beforeEach(() => {
    waitsForPromise(async () => {
      if (projectDir == null) {
        projectDir = await copyBuildFixture('test-buck-project', __dirname);
      }
      linkTreeManager = new LinkTreeManager();
    });
  });

  it('correctly builds a link tree path given a source file path (mocked project)', () => {
    waitsForPromise(async () => {
      spyOn(BuckService, 'getOwners').andReturn(
        Promise.resolve(['//test:a', '//test2:a']),
      );
      const spy = spyOn(BuckService, 'queryWithAttributes').andReturn({
        '//test:x': {
          'buck.type': 'python_binary',
        },
        '//test:y': {
          'buck.type': 'python_test',
        },
      });
      const srcPath = nuclideUri.join(projectDir, 'test1/test1.py');
      const expectedPaths = [
        nuclideUri.join(projectDir, 'buck-out/gen/test/x#link-tree'),
        nuclideUri.join(projectDir, 'buck-out/gen/test/y#binary,link-tree'),
      ];

      const linkTreePaths = await linkTreeManager.getLinkTreePaths(srcPath);
      // rdeps query should be executed with the first owner found, and scoped to
      // the target's immediate neighbors.
      expect(spy).toHaveBeenCalledWith(
        projectDir,
        'kind("python_binary|python_test", rdeps(//test/..., //test:a))',
        ['buck.type', 'deps'],
      );
      // Properly resolve a link-tree path based on the source's firstly found
      // binary dependency.
      expect(linkTreePaths).toEqual(expectedPaths);
    });
  });

  it("resolves a link tree path with a buck project's source file", () => {
    // Large timeout for buck to warm up.
    waitsForPromise({timeout: 30000}, async () => {
      const srcPath = nuclideUri.join(projectDir, 'test1/test1.py');
      const linkTreePaths = await linkTreeManager.getLinkTreePaths(srcPath);
      expect(linkTreePaths).toEqual([
        nuclideUri.join(projectDir, 'buck-out/gen/test1/testbin1#link-tree'),
      ]);
    });
  });

  it('ignores TARGETS files', () => {
    waitsForPromise(async () => {
      spyOn(BuckService, 'getOwners').andThrow(Error('test'));
      const srcPath = nuclideUri.join(projectDir, 'test1/TARGETS');
      expect(await linkTreeManager.getLinkTreePaths(srcPath)).toEqual([]);
    });
  });
});
