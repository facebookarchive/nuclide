"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _ClangServer() {
  const data = _interopRequireDefault(require("../lib/ClangServer"));

  _ClangServer = function () {
    return data;
  };

  return data;
}

function _findClangServerArgs() {
  const data = _interopRequireDefault(require("../lib/find-clang-server-args"));

  _findClangServerArgs = function () {
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
const TEST_FILE = _nuclideUri().default.join(__dirname, '../__mocks__', 'fixtures', 'cpp_buck_project', 'outline.cpp');

const FILE_CONTENTS = _fs.default.readFileSync(TEST_FILE, 'utf8');

describe('ClangServer', () => {
  it('can return outline data', async () => {
    const serverArgs = (0, _findClangServerArgs().default)();
    const server = new (_ClangServer().default)(TEST_FILE, FILE_CONTENTS, serverArgs, Promise.resolve({
      flags: ['-x', 'c++'],
      usesDefaultFlags: false,
      flagsFile: null
    }));
    const service = await server.getService();
    const response = await service.get_outline(FILE_CONTENTS);

    if (!(response != null)) {
      throw new Error("Invariant violation: \"response != null\"");
    }

    expect(response).toMatchSnapshot();
  });
});