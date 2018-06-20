'use strict';

var _ProjectUtils;

function _load_ProjectUtils() {
  return _ProjectUtils = _interopRequireWildcard(require('../ProjectUtils'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('getLabelFromPath', () => {
  it('extracts a pretty label', () => {
    const pathsToExpectedLabels = new Map([['nuclide://x.com/abc/def/my_project.project.toml', 'My Project'], ['nuclide://x.com/abc/def/my_project', 'My Project'], ['nuclide://x.com/abc/def/My_iOS_Project.project.toml', 'My iOS Project']]);

    pathsToExpectedLabels.forEach((label, path) => {
      expect((_ProjectUtils || _load_ProjectUtils()).getLabelFromPath(path)).toBe(label);
    });
  });
}); /**
     * Copyright (c) 2017-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the BSD-style license found in the
     * LICENSE file in the root directory of this source tree. An additional grant
     * of patent rights can be found in the PATENTS file in the same directory.
     *
     *  strict-local
     * @format
     */