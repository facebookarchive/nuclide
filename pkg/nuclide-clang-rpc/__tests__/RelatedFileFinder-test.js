'use strict';

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _finders;

function _load_finders() {
  return _finders = require('../lib/related-file/finders');
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
 */

describe('getRelatedSourceForHeader', () => {
  const finder = new (_finders || _load_finders()).RelatedFileFinder();

  it('does not fall back to a source file when looking for a source in a non-buck project', async () => {
    await (async () => {
      const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/compile_commands.json', ''], ['a/source.cpp', '']]));
      const file = await finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/header.h'));
      expect(file).toBeFalsy();
    })();
  });

  it('is able to find an absolute include with project root but with a different real root', async () => {
    await (async () => {
      jest.spyOn(finder, '_getFBProjectRoots').mockReturnValue(['project/subproject']);
      const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/project/subproject/subroot/source.cpp', '#include "subroot/header.h"']]));
      const sourceFile = (_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/project/subproject/subroot/source.cpp');
      const file = await finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/project/subproject/subroot/header.h'), (_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/project/subproject/subroot'));
      expect(file).toBe(sourceFile);
    })();
  });

  it('is able to find an absolute include without project root', async () => {
    jest.spyOn(finder, '_getFBProjectRoots').mockReturnValue(['project/subproject']);
    await (async () => {
      const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/project/subproject/subroot/source.cpp', '#include "subroot/boom/header.h"']]));
      const sourceFile = (_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/project/subproject/subroot/source.cpp');
      const file = await finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/project/subproject/subroot/boom/header.h'));
      expect(file).toBe(sourceFile);
    })();
  });

  it('is able to find an absolute include', async () => {
    await (async () => {
      const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/b.cpp', '#include <a/b.h>']]));
      const sourceFile = (_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/b.cpp');
      const file = await finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/b.h'), tmpdir);
      expect(file).toBe(sourceFile);
    })();
  });

  it('is able to find a relative include', async () => {
    await (async () => {
      const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/x.cpp', '#include <../x.h>']]));
      const sourceFile = (_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/x.cpp');
      const file = await finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'x.h'), tmpdir);
      expect(file).toBe(sourceFile);
    })();
  });

  it('rejects non-matching relative includes', async () => {
    const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/b.cpp', '#include <../../x.h>']]));
    const file = await finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'x.h'), tmpdir);
    expect(file).toBeFalsy();
  });

  it('returns null for invalid paths', async () => {
    const file = await finder.getRelatedSourceForHeader('/this/is/not/a/path', '/lol');
    expect(file).toBeFalsy();
  });

  it('caches results of finding source for header', async () => {
    await (async () => {
      const implSpy = jest.spyOn(finder, '_getRelatedSourceForHeaderImpl');
      const tmpdir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('clang_rpc', new Map([['a/x.cpp', '#include <../x.h>']]));
      const sourceFile = (_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'a/x.cpp');
      // Call it a few times and make sure the underlying impl only ran once.
      const results = await Promise.all(Array.from((0, (_collection || _load_collection()).range)(0, 10)).map(() => finder.getRelatedSourceForHeader((_nuclideUri || _load_nuclideUri()).default.join(tmpdir, 'x.h'), tmpdir)));
      for (const file of results) {
        expect(file).toBe(sourceFile);
      }
      expect(implSpy.mock.calls.length).toBe(1);
    })();
  });
});