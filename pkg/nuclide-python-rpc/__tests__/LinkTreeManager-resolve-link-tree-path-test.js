'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));
}

var _LinkTreeManager;

function _load_LinkTreeManager() {
  return _LinkTreeManager = _interopRequireDefault(require('../lib/LinkTreeManager'));
}

var _nuclideTestHelpers;

function _load_nuclideTestHelpers() {
  return _nuclideTestHelpers = require('../../nuclide-test-helpers');
}

var _path = _interopRequireDefault(require('path'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.setTimeout(60000);

// Disable buckd so it doesn't linger around after the test.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

process.env.NO_BUCKD = '1';

describe('LinkTreeManager', () => {
  let linkTreeManager = null;
  let projectDir = null;

  beforeEach(async () => {
    global.performance.mark = jest.fn();
    global.performance.measure = jest.fn();
    global.performance.clearMarks = jest.fn();
    global.performance.clearMeasures = jest.fn();

    if (projectDir == null) {
      projectDir = await (0, (_nuclideTestHelpers || _load_nuclideTestHelpers()).copyBuildFixture)('test-buck-project', _path.default.resolve(__dirname, '../__mocks__'));
    }
    linkTreeManager = new (_LinkTreeManager || _load_LinkTreeManager()).default();
  });

  // this test is very slow because it runs buck under the hood
  it("resolves a link tree path with a buck project's source file", async () => {
    const srcPath = (_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'test1/test1.py');
    const linkTreePaths = await linkTreeManager.getLinkTreePaths(srcPath);
    expect(linkTreePaths).toEqual([(_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'buck-out/gen/test1/testbin1#link-tree')]);
  });
});