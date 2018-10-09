"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _hgRepository() {
  const data = _interopRequireDefault(require("../lib/hg-repository"));

  _hgRepository = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
describe('findHgRepository', () => {
  it('finds an hg repo without an hgrc', async () => {
    const fixturePath = await (0, _testHelpers().generateFixture)('hg-repo', new Map([['a/b/.hg/fakefile', ''], ['a/b/c/d/e', '']]));
    expect((0, _hgRepository().default)(_nuclideUri().default.join(fixturePath, 'a/b/c/d'))).toEqual({
      repoPath: _nuclideUri().default.join(fixturePath, 'a/b/.hg'),
      originURL: null,
      workingDirectoryPath: _nuclideUri().default.join(fixturePath, 'a/b')
    });
  });
  it('finds an hg repo with an hgrc', async () => {
    const fixturePath = await (0, _testHelpers().generateFixture)('hg-repo', new Map([['a/b/.hg/hgrc', '[paths]\ndefault = foo'], ['a/b/c/d/e', '']]));
    expect((0, _hgRepository().default)(_nuclideUri().default.join(fixturePath, 'a/b/c/d'))).toEqual({
      repoPath: _nuclideUri().default.join(fixturePath, 'a/b/.hg'),
      originURL: 'foo',
      workingDirectoryPath: _nuclideUri().default.join(fixturePath, 'a/b')
    });
  });
  it('finds the first hg repo', async () => {
    const fixturePath = await (0, _testHelpers().generateFixture)('hg-repo', new Map([['a/b/.hg/hgrc', ''], ['a/.hg/hgrc', ''], ['a/b/c/d/e', '']]));
    expect((0, _hgRepository().default)(_nuclideUri().default.join(fixturePath, 'a/b/c/d'))).toEqual({
      repoPath: _nuclideUri().default.join(fixturePath, 'a/b/.hg'),
      originURL: null,
      workingDirectoryPath: _nuclideUri().default.join(fixturePath, 'a/b')
    });
  });
  it('works with no hg repo', async () => {
    const fixturePath = await (0, _testHelpers().generateFixture)('hg-repo', new Map([['a/b/.git/fakefile', ''], ['a/b/c/d/e', '']]));
    expect((0, _hgRepository().default)(_nuclideUri().default.join(fixturePath, 'a/b/c/d'))).toBe(null);
  });
});