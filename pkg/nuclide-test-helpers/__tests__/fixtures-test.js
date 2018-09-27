"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _fixtures() {
  const data = require("../lib/fixtures");

  _fixtures = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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
const FIXTURE_DIR = _nuclideUri().default.resolve(__dirname, '../__mocks__');

describe('copyFixture', () => {
  it('should copy a directory recursively', async () => {
    const copyOfFixture = await (0, _fixtures().copyFixture)('fixture-to-copy', FIXTURE_DIR);
    expect(_nuclideUri().default.isAbsolute(copyOfFixture)).toBe(true);
    expect(_fs.default.statSync(copyOfFixture).isDirectory()).toBe(true);

    const file1txt = _nuclideUri().default.join(copyOfFixture, 'file1.txt');

    expect(_fs.default.statSync(file1txt).isFile()).toBe(true);
    expect(_fs.default.readFileSync(file1txt, 'utf8')).toBe('hello\n');

    const dir1 = _nuclideUri().default.join(copyOfFixture, 'dir1');

    expect(_fs.default.statSync(dir1).isDirectory()).toBe(true);

    const file2txt = _nuclideUri().default.join(dir1, 'file2.txt');

    expect(_fs.default.statSync(file2txt).isFile()).toBe(true);
    expect(_fs.default.readFileSync(file2txt, 'utf8')).toBe('world\n');
  });
  it('should find fixtures in parent directories', async () => {
    const fixtureStartDir = _nuclideUri().default.join(FIXTURE_DIR, 'fixtures/deep1/deep2');

    const copyOfFixture = await (0, _fixtures().copyFixture)('fixture-to-find', fixtureStartDir);
    expect(_nuclideUri().default.isAbsolute(copyOfFixture)).toBe(true);
    expect(_fs.default.statSync(copyOfFixture).isDirectory()).toBe(true);

    const file1txt = _nuclideUri().default.join(copyOfFixture, 'file1.txt');

    expect(_fs.default.statSync(file1txt).isFile()).toBe(true);
    expect(_fs.default.readFileSync(file1txt, 'utf8')).toBe('beep boop\n');
  });
});
describe('copyBuildFixture', () => {
  it('should rename {BUCK,TARGETS}-rename to {BUCK,TARGETS}', async () => {
    const buildFixture = await (0, _fixtures().copyBuildFixture)('build-fixture', FIXTURE_DIR);
    expect(_nuclideUri().default.isAbsolute(buildFixture)).toBe(true);
    expect(_fs.default.statSync(buildFixture).isDirectory()).toBe(true);
    const renames = await _fsPromise().default.glob('**/*', {
      cwd: buildFixture,
      nodir: true
    });
    expect(renames).toEqual(['BUCK', 'otherdir/BUCK', 'otherdir/otherfile', 'somedir/somefile', 'somedir/TARGETS']);
  });
});