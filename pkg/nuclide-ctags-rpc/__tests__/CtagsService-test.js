"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _() {
  const data = require("..");

  _ = function () {
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
const TAGS_PATH = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'tags');

describe('getCtagsService', () => {
  it('can find the tags file from a path', async () => {
    const filePath = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'a.cpp');

    const svc = await (0, _().getCtagsService)(filePath);

    if (!svc) {
      throw new Error("Invariant violation: \"svc\"");
    }

    expect((await svc.getTagsPath())).toBe(_nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'tags'));
  });
  it('returns null when no tags file exists', async () => {
    const filePath = '/!@#$%^&/test';
    const svc = await (0, _().getCtagsService)(filePath);
    expect(svc).toBe(null);
  });
  it('returns null when a TAGS file exists', async () => {
    const filePath = _nuclideUri().default.join(__dirname, 'emacs', 'test');

    const svc = await (0, _().getCtagsService)(filePath);
    expect(svc).toBe(null);
  });
});
describe('CtagsService.findTags', () => {
  it('can read a tags file', async () => {
    const svc = new (_().CtagsService)(TAGS_PATH);
    let tags = await svc.findTags('a');
    expect(tags).toEqual([{
      name: 'a',
      file: _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'a.cpp'),
      lineNumber: 0,
      kind: '',
      pattern: '/^void a() {$/'
    }]);
    tags = await svc.findTags('b');
    expect(tags).toEqual([{
      name: 'b',
      file: _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'b.cpp'),
      lineNumber: 0,
      kind: 'f',
      pattern: '/^void b() {$/',
      fields: new Map([['namespace', 'test']])
    }]);
  });
  it('ignores missing files', async () => {
    const svc = new (_().CtagsService)(TAGS_PATH);
    const tags = await svc.findTags('c'); // A tag for `c` exists, but the file has been deliberately removed.

    expect(tags).toEqual([]);
  });
  it('respects the given limit', async () => {
    const svc = new (_().CtagsService)(TAGS_PATH);
    const tags = await svc.findTags('', {
      partialMatch: true,
      limit: 1
    });
    expect(tags).toEqual([{
      name: 'a',
      file: _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'a.cpp'),
      lineNumber: 0,
      kind: '',
      pattern: '/^void a() {$/'
    }]);
  });
});