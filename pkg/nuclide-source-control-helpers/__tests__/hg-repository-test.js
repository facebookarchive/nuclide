'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _hgRepository;

function _load_hgRepository() {
  return _hgRepository = _interopRequireDefault(require('../lib/hg-repository'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('findHgRepository', () => {
  it('finds an hg repo without an hgrc', async () => {
    await (async () => {
      const fixturePath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg-repo', new Map([['a/b/.hg/fakefile', ''], ['a/b/c/d/e', '']]));
      expect((0, (_hgRepository || _load_hgRepository()).default)((_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/c/d'))).toEqual({
        repoPath: (_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/.hg'),
        originURL: null,
        workingDirectoryPath: (_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b')
      });
    })();
  });

  it('finds an hg repo with an hgrc', async () => {
    await (async () => {
      const fixturePath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg-repo', new Map([['a/b/.hg/hgrc', '[paths]\ndefault = foo'], ['a/b/c/d/e', '']]));
      expect((0, (_hgRepository || _load_hgRepository()).default)((_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/c/d'))).toEqual({
        repoPath: (_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/.hg'),
        originURL: 'foo',
        workingDirectoryPath: (_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b')
      });
    })();
  });

  it('finds the first hg repo', async () => {
    await (async () => {
      const fixturePath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg-repo', new Map([['a/b/.hg/hgrc', ''], ['a/.hg/hgrc', ''], ['a/b/c/d/e', '']]));
      expect((0, (_hgRepository || _load_hgRepository()).default)((_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/c/d'))).toEqual({
        repoPath: (_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/.hg'),
        originURL: null,
        workingDirectoryPath: (_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b')
      });
    })();
  });

  it('works with no hg repo', async () => {
    await (async () => {
      const fixturePath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg-repo', new Map([['a/b/.git/fakefile', ''], ['a/b/c/d/e', '']]));
      expect((0, (_hgRepository || _load_hgRepository()).default)((_nuclideUri || _load_nuclideUri()).default.join(fixturePath, 'a/b/c/d'))).toBe(null);
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */