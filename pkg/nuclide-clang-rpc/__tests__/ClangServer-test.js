"use strict";

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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

function FileWatcherService() {
  const data = _interopRequireWildcard(require("../../nuclide-filewatcher-rpc"));

  FileWatcherService = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const TEST_FILE = _nuclideUri().default.join(__dirname, '../__mocks__', 'fixtures', 'cpp_buck_project', 'test.cpp');

const FILE_CONTENTS = _fs.default.readFileSync(TEST_FILE).toString('utf8');

describe('ClangServer', () => {
  const serverFlags = Promise.resolve({
    flags: [],
    usesDefaultFlags: false,
    flagsFile: null
  });
  it('can handle requests', async () => {
    const serverArgs = (0, _findClangServerArgs().default)();
    const server = new (_ClangServer().default)(TEST_FILE, FILE_CONTENTS, serverArgs, serverFlags);
    const service = await server.getService();
    let response = await server.compile(FILE_CONTENTS);

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    expect(JSON.stringify(response, null, 2).replace(/file":\s+.*test\.cpp/g, 'file": "<REPLACED>')).toMatchSnapshot();
    response = await service.get_completions(FILE_CONTENTS, 4, 7, 7, 'f');

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    expect(response.map(x => x.spelling).sort()).toEqual(['f(int x = 0)', 'false', 'float']); // This will hit the cache. Double-check the result.

    response = await service.get_completions(FILE_CONTENTS, 4, 7, 7, 'fa');

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    expect(response.map(x => x.spelling).sort()).toEqual(['false']); // Function argument completions are a little special.

    response = await service.get_completions(FILE_CONTENTS, 4, 4, 4, '');

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    expect(response[0].spelling).toBe('f(int x = 0)');
    expect(response[0].cursor_kind).toBe('OVERLOAD_CANDIDATE');
    response = await service.get_declaration(FILE_CONTENTS, 4, 2);

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    const {
      point,
      spelling,
      type
    } = response;
    expect(point).toEqual(new (_simpleTextBuffer().Point)(0, 5));
    expect(spelling).toBe('f');
    expect(type).toBe('void (int)');
    response = await service.get_declaration_info(FILE_CONTENTS, 4, 2);

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    expect(response.length).toBe(1);
    expect(response[0].name).toBe('f(int)');
    expect(response[0].type).toBe('FUNCTION_DECL'); // May not be consistent between clang versions.

    expect(response[0].cursor_usr).not.toBe(null);
    expect(response[0].is_definition).toBe(true);
    response = await service.get_outline(FILE_CONTENTS);

    if (!response) {
      throw new Error("Invariant violation: \"response\"");
    }

    expect(response).toMatchSnapshot();
  });
  it('gracefully handles server crashes', async () => {
    const serverArgs = (0, _findClangServerArgs().default)();
    const server = new (_ClangServer().default)(TEST_FILE, FILE_CONTENTS, serverArgs, serverFlags);
    let response = await server.compile(FILE_CONTENTS);
    expect(response).not.toBe(null);
    const {
      _process
    } = server._rpcProcess;

    if (!_process) {
      throw new Error("Invariant violation: \"_process\"");
    }

    _process.kill(); // This request should fail, but cleanup should occur.


    let thrown = false;

    try {
      response = await server.compile(FILE_CONTENTS);
    } catch (e) {
      thrown = true;
    }

    expect(thrown).toBe(true); // The next request should work as expected.

    const service = await server.getService();
    response = await service.get_declaration(FILE_CONTENTS, 4, 2);
    expect(response).not.toBe(null);
  });
  it('supports get_local_references', async () => {
    const file = _nuclideUri().default.join(__dirname, '../__mocks__', 'fixtures', 'cpp_buck_project', 'references.cpp');

    const fileContents = _fs.default.readFileSync(file).toString('utf8');

    const serverArgs = (0, _findClangServerArgs().default)();
    const server = new (_ClangServer().default)(file, fileContents, serverArgs, serverFlags);
    const service = await server.getService();
    const compileResponse = await server.compile(fileContents);

    if (!(compileResponse != null)) {
      throw new Error("Invariant violation: \"compileResponse != null\"");
    }

    expect(compileResponse.diagnostics).toEqual([]); // param var1

    expect((await service.get_local_references(fileContents, 1, 24))).toMatchSnapshot(); // var2 (from a reference)

    expect((await service.get_local_references(fileContents, 4, 9))).toMatchSnapshot(); // var3

    expect((await service.get_local_references(fileContents, 2, 26))).toMatchSnapshot(); // inner var1

    expect((await service.get_local_references(fileContents, 6, 11))).toMatchSnapshot(); // nothing

    expect((await service.get_local_references(fileContents, 0, 0))).toBe(null);
    expect((await service.get_local_references(fileContents, 11, 0))).toBe(null);
  });
  it('tracks server status', async () => {
    const serverArgs = (0, _findClangServerArgs().default)();
    const server = new (_ClangServer().default)(TEST_FILE, '', serverArgs, serverFlags);
    expect(server.getStatus()).toBe('finding_flags');
    await (0, _waits_for().default)(() => server.getStatus() === 'compiling', 'compilation');
    await (0, _waits_for().default)(() => server.getStatus() === 'ready', 'ready');
  });
  it('listens to flag changes', async () => {
    const subject = new _RxMin.Subject();
    jest.spyOn(FileWatcherService(), 'watchWithNode').mockReturnValue(subject.publish());
    const serverArgs = (0, _findClangServerArgs().default)();
    const server = new (_ClangServer().default)(TEST_FILE, '', serverArgs, Promise.resolve({
      flags: [],
      usesDefaultFlags: false,
      flagsFile: ''
    }));
    await server.waitForReady();
    subject.next(null);
    expect(server.getFlagsChanged()).toBe(true);
  });
});