"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _LinkTreeManager() {
  const data = _interopRequireDefault(require("../lib/LinkTreeManager"));

  _LinkTreeManager = function () {
    return data;
  };

  return data;
}

function _nuclideTestHelpers() {
  const data = require("../../nuclide-test-helpers");

  _nuclideTestHelpers = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.setTimeout(60000); // Disable buckd so it doesn't linger around after the test.

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
      projectDir = await (0, _nuclideTestHelpers().copyBuildFixture)('test-buck-project', _path.default.resolve(__dirname, '../__mocks__'));
    }

    linkTreeManager = new (_LinkTreeManager().default)();
  }); // this test is very slow because it runs buck under the hood

  it("resolves a link tree path with a buck project's source file", async () => {
    const srcPath = _nuclideUri().default.join(projectDir, 'test1/test1.py');

    const linkTreePaths = await linkTreeManager.getLinkTreePaths(srcPath);
    expect(linkTreePaths).toEqual([_nuclideUri().default.join(projectDir, 'buck-out/gen/test1/testbin1#link-tree')]);
  });
});