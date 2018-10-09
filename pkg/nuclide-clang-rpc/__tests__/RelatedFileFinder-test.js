"use strict";

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

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

function _finders() {
  const data = require("../lib/related-file/finders");

  _finders = function () {
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
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('getRelatedSourceForHeader', () => {
  const finder = new (_finders().RelatedFileFinder)();
  it('does not fall back to a source file when looking for a source in a non-buck project', async () => {
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/compile_commands.json', ''], ['a/source.cpp', '']]));
    const file = await finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'a/header.h'));
    expect(file).toBeFalsy();
  });
  it('is able to find an absolute include with project root but with a different real root', async () => {
    jest.spyOn(finder, '_getFBProjectRoots').mockReturnValue(['project/subproject']);
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/project/subproject/subroot/source.cpp', '#include "subroot/header.h"']]));

    const sourceFile = _nuclideUri().default.join(tmpdir, 'a/project/subproject/subroot/source.cpp');

    const file = await finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'a/project/subproject/subroot/header.h'), _nuclideUri().default.join(tmpdir, 'a/project/subproject/subroot'));
    expect(file).toBe(sourceFile);
  });
  it('is able to find an absolute include without project root', async () => {
    jest.spyOn(finder, '_getFBProjectRoots').mockReturnValue(['project/subproject']);
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/project/subproject/subroot/source.cpp', '#include "subroot/boom/header.h"']]));

    const sourceFile = _nuclideUri().default.join(tmpdir, 'a/project/subproject/subroot/source.cpp');

    const file = await finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'a/project/subproject/subroot/boom/header.h'));
    expect(file).toBe(sourceFile);
  });
  it('is able to find an absolute include', async () => {
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/b.cpp', '#include <a/b.h>']]));

    const sourceFile = _nuclideUri().default.join(tmpdir, 'a/b.cpp');

    const file = await finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'a/b.h'), tmpdir);
    expect(file).toBe(sourceFile);
  });
  it('is able to find a relative include', async () => {
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/x.cpp', '#include <../x.h>']]));

    const sourceFile = _nuclideUri().default.join(tmpdir, 'a/x.cpp');

    const file = await finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'x.h'), tmpdir);
    expect(file).toBe(sourceFile);
  });
  it('rejects non-matching relative includes', async () => {
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/b.cpp', '#include <../../x.h>']]));
    const file = await finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'x.h'), tmpdir);
    expect(file).toBeFalsy();
  });
  it('returns null for invalid paths', async () => {
    const file = await finder.getRelatedSourceForHeader('/this/is/not/a/path', '/lol');
    expect(file).toBeFalsy();
  });
  it('caches results of finding source for header', async () => {
    const implSpy = jest.spyOn(finder, '_getRelatedSourceForHeaderImpl');
    const tmpdir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([['a/x.cpp', '#include <../x.h>']]));

    const sourceFile = _nuclideUri().default.join(tmpdir, 'a/x.cpp'); // Call it a few times and make sure the underlying impl only ran once.


    const results = await Promise.all(Array.from((0, _collection().range)(0, 10)).map(() => finder.getRelatedSourceForHeader(_nuclideUri().default.join(tmpdir, 'x.h'), tmpdir)));

    for (const file of results) {
      expect(file).toBe(sourceFile);
    }

    expect(implSpy.mock.calls.length).toBe(1);
  });
});