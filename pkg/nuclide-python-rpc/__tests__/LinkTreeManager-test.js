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

jest.setTimeout(35000);

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

  it('correctly builds a link tree path given a source file path (mocked project)', async () => {
    jest.spyOn(_nuclideBuckRpc || _load_nuclideBuckRpc(), 'getOwners').mockReturnValue(Promise.resolve(['//test:a', '//test2:a']));
    const spy = jest.spyOn(_nuclideBuckRpc || _load_nuclideBuckRpc(), 'queryWithAttributes').mockReturnValue({
      '//test:x': {
        'buck.type': 'python_binary'
      },
      '//test:y': {
        'buck.type': 'python_test'
      }
    });
    const srcPath = (_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'test1/test1.py');
    const expectedPaths = [(_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'buck-out/gen/test/x#link-tree'), (_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'buck-out/gen/test/y#binary,link-tree')];

    const linkTreePaths = await linkTreeManager.getLinkTreePaths(srcPath);
    // rdeps query should be executed with the first owner found, and scoped to
    // the target's immediate neighbors.
    expect(spy).toHaveBeenCalledWith(projectDir, 'kind("python_binary|python_test", rdeps(//test/..., //test:a))', ['buck.type', 'deps']);
    // Properly resolve a link-tree path based on the source's firstly found
    // binary dependency.
    expect(linkTreePaths).toEqual(expectedPaths);
  });

  it('ignores TARGETS files', async () => {
    jest.spyOn(_nuclideBuckRpc || _load_nuclideBuckRpc(), 'getOwners').mockImplementation(() => {
      throw new Error('test');
    });
    const srcPath = (_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'test1/TARGETS');
    expect((await linkTreeManager.getLinkTreePaths(srcPath))).toEqual([]);
  });
});