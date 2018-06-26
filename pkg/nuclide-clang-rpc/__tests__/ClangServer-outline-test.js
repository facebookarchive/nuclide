'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _ClangServer;

function _load_ClangServer() {
  return _ClangServer = _interopRequireDefault(require('../lib/ClangServer'));
}

var _findClangServerArgs;

function _load_findClangServerArgs() {
  return _findClangServerArgs = _interopRequireDefault(require('../lib/find-clang-server-args'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TEST_FILE = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__', 'fixtures', 'cpp_buck_project', 'outline.cpp'); /**
                                                                                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                               * All rights reserved.
                                                                                                                                               *
                                                                                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                               * the root directory of this source tree.
                                                                                                                                               *
                                                                                                                                               * 
                                                                                                                                               * @format
                                                                                                                                               */

const FILE_CONTENTS = _fs.default.readFileSync(TEST_FILE, 'utf8');

describe('ClangServer', () => {
  it('can return outline data', async () => {
    const serverArgs = (0, (_findClangServerArgs || _load_findClangServerArgs()).default)();
    const server = new (_ClangServer || _load_ClangServer()).default(TEST_FILE, FILE_CONTENTS, serverArgs, Promise.resolve({
      flags: ['-x', 'c++'],
      usesDefaultFlags: false,
      flagsFile: null
    }));
    const service = await server.getService();
    const response = await service.get_outline(FILE_CONTENTS);

    if (!(response != null)) {
      throw new Error('Invariant violation: "response != null"');
    }

    expect(response).toMatchSnapshot();
  });
});