/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import * as ProjectUtils from '../ProjectUtils';

describe('getLabelFromPath', () => {
  it('extracts a pretty label', () => {
    const pathsToExpectedLabels = new Map([
      ['nuclide://x.com/abc/def/my_project.project.toml', 'My Project'],
      ['nuclide://x.com/abc/def/my_project', 'My Project'],
      ['nuclide://x.com/abc/def/My_iOS_Project.project.toml', 'My iOS Project'],
    ]);

    pathsToExpectedLabels.forEach((label, path) => {
      expect(ProjectUtils.getLabelFromPath(path)).toBe(label);
    });
  });
});
